import { FS } from 'grind-support'

const path = require('path')
const crypto = require('crypto')
const dateFormat = require('dateformat')

const HTTP_DATE_FORMAT = 'ddd, dd mmm yyyy HH:MM:ss Z'

export class CompileController {
	app = null
	factory = null
	local = null
	resources = null

	constructor(app, factory) {
		this.app = app
		this.factory = factory
		this.local = app.env() === 'local'
		this.resources = app.paths.base('resources')

		if(app.cache.isNil) {
			Log.error('WARNING: grind-cache not detected, assets will be recompiled every time they’re loaded.')
		}
	}

	async compile(req, res) {
		if(req.path.indexOf('..') >= 0) {
			throw new NotFoundError()
		}

		const pathname = path.join(this.resources, req.path)
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

			let result = await asset.compile().then(result => {
				if(!(result instanceof Buffer)) {
					return new Buffer(result)
				}

				return result
			})

			const postProcessors = this.factory.getPostProcessorsFromPath(`out.${asset.extension}`).filter(
				processor => processor.shouldOptimize
			)

			if(postProcessors.length > 0) {
				for(const postProcessor of postProcessors) {
					result = await postProcessor.process(asset.path, null, result)

					if(!(result instanceof Buffer)) {
						result = new Buffer(result)
					}
				}
			}

			return new Buffer(result)
		}

		let promise = null

		if(this.app.cache.isNil || req.query['ignore-cache'] === 'true') {
			promise = compile()
		} else {
			const key = `${req.path.replace(/[^a-z0-9]+/, '-')}-${lastModifiedDate.getTime()}`
			promise = this.app.cache.wrap(key, compile, { ttl: 86400 }).then(data => {
				if(!(data instanceof Buffer) && !data.data.isNil) {
					return Buffer.from(data)
				}

				return data
			})
		}

		return promise.then(content => {
			res.header('Cache-Control', 'public, max-age=31536000')
			res.header('Expires', dateFormat(expires, HTTP_DATE_FORMAT))
			res.header('Last-Modified', dateFormat(lastModifiedDate, HTTP_DATE_FORMAT))
			res.header('ETag', etag)
			res.header('Content-Type', `${asset.mime}; charset=utf-8`)

			res.send(content)
		}).catch(err => {
			res.status(500)
			res.header('Content-Type', 'text/plain')

			const body = this._buildErrorString(err)
			Log.error('Asset compilation error', body)
			res.send(`/*\n${body}\n*/`)
		})
	}

	_buildErrorString(err) {
		let body = ''

		if(!err.file.isNil) {
			body += err.file

			if(err.line) {
				body += `:${err.line}`

				if(err.column) {
					body += `:${err.column}`
				}
			}

			body += '\n\t'
		}

		body += err.message

		return body
	}

}
