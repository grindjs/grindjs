import { FS } from 'grind-support'

const path = require('path')
const crypto = require('crypto')
const dateFormat = require('dateformat')
const stripAnsi = require('strip-ansi')

const HTTP_DATE_FORMAT = 'ddd, dd mmm yyyy HH:MM:ss Z'

export class CompileController {

	app = null
	factory = null
	local = null
	sourcePath = null

	constructor(app, factory) {
		this.app = app
		this.factory = factory
		this.local = app.env() === 'local'
		this.sourcePath = app.paths.base(app.config.get('assets.paths.source'))

		if(app.cache.isNil) {
			Log.error('WARNING: grind-cache not detected, assets will be recompiled every time they’re loaded.')
		}
	}

	async compile(req, res) {
		if(req.path.indexOf('..') >= 0) {
			throw new NotFoundError()
		}

		const pathname = path.join(this.sourcePath, path.relative('/assets', req.path))
		const exists = await FS.exists(pathname)

		if(!exists) {
			throw new NotFoundError()
		}

		return this._serve(req, res, this.factory.make(pathname))
	}

	async _serve(req, res, asset) {
		const lastModified = await asset.lastModified()

		const sha1 = crypto.createHash('sha1')
		sha1.update(`${asset.path}_${lastModified}`)
		const etag = `"${sha1.digest('hex')}"`

		if(!req.headers.http_if_none_match.isNil && req.headers.http_if_none_match === etag) {
			res.send(304)
			return
		}

		const expires = new Date((lastModified + 31536000) * 1000.0)
		const lastModifiedDate = new Date(lastModified * 1000.0)

		const compile = async () => {
			res.header('X-Cached', 'false')

			let result = await asset.compile(null, req).then(result => {
				if(!(result instanceof Buffer)) {
					return Buffer.from(result)
				}

				return result
			})

			const postProcessors = this.factory.getPostProcessorsFromPath(`out.${asset.extension}`)

			if(postProcessors.length > 0) {
				for(const postProcessor of postProcessors) {
					result = await postProcessor.process(asset.path, null, result)

					if(!(result instanceof Buffer)) {
						result = Buffer.from(result)
					}
				}
			}

			return Buffer.from(result)
		}

		let promise = null

		if(this.app.cache.isNil || req.query['ignore-cache'] === 'true') {
			promise = compile()
		} else {
			const key = `${req.path.replace(/[^a-z0-9]+/, '-')}-${lastModifiedDate.getTime()}`
			const memoryCache = this.app.debug ? (global.__grindAssetsCache = global.__grindAssetsCache || { }) : { }

			if(this.app.debug && memoryCache[key] instanceof Buffer) {
				promise = Promise.resolve(memoryCache[key])
			} else {
				promise = this.app.cache.wrap(key, compile, { ttl: 86400 }).then(data => {
					if(!(data instanceof Buffer) && !data.data.isNil) {
						return Buffer.from(data)
					}

					return data
				})

				if(this.app.debug) {
					promise = promise.then(data => {
						if(this.app.debug) {
							memoryCache[key] = data
						}

						return data
					})
				}
			}
		}

		return promise.then(content => {
			if(this.app.debug) {
				res.header('Cache-Control', 'no-cache')
			} else {
				res.header('Cache-Control', 'public, max-age=31536000')
				res.header('Expires', dateFormat(expires, HTTP_DATE_FORMAT))
			}

			res.header('Last-Modified', dateFormat(lastModifiedDate, HTTP_DATE_FORMAT))
			res.header('ETag', etag)
			res.header('Content-Type', `${asset.mime}; charset=utf-8`)

			res.send(content)
		}).catch(err => {
			res.status(500)
			res.header('Content-Type', 'text/plain')

			Log.error('Asset compilation error', err.message, err)

			if(!this.app.assets.websocket.isNil) {
				this.app.assets.websocket.sendAll({
					type: 'error',
					asset: path.relative(this.app.paths.base(), asset.path),
					assetType: asset.kind,
					error: err.message
				}, true)
			}

			res.send(`/*\n${stripAnsi(err.message)}\n*/`)
		})
	}

}
