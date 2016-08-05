import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import dateFormat from 'dateformat'

export class Controller {
	app = null
	factory = null
	local = null
	resources = null

	constructor(app, factory) {
		this.app = app
		this.factory = factory
		this.local = app.env() === 'local'
		this.resources = app.paths.base('resources')
	}

	font(req, res) {
		let contentType = null

		switch(path.extname(req.path).toLowerCase()) {
			case 'svg':
				contentType = 'image/svg+xml'
				break
			case 'eot':
				contentType = 'application/vnd.ms-fontobject'
				break
			case 'woff':
				contentType = 'application/x-font-woff'
				break
			case 'otf':
				contentType = 'font/opentype'
				break
			case 'ttf':
			default:
				contentType = 'application/x-font-ttf'
				break
		}

		return this._process(req, res, contentType)
	}

	img(req, res) {
		let contentType = null

		switch(path.extname(req.path).toLowerCase()) {
			case '.svg':
				contentType = 'image/svg+xml'
				break
			case '.png':
				contentType = 'image/png'
				break
			case '.gif':
				contentType = 'image/gif'
				break
			case '.ico':
				contentType = 'image/x-icon'
				break
			case '.jpeg':
			case '.jpg':
			default:
				contentType = 'image/jpeg'
				break
		}

		return this._process(req, res, contentType)
	}

	css(req, res) {
		return this._process(req, res, 'text/css')
	}

	compile(req, res) {
		const asset = this.factory.make(this.assetPath(req))

		return asset.lastModified().then(modified =>
			this._process(req, res, asset.mime, asset, modified)
		)
	}

	/**
	 * Gets the path for the request assets and handles caching/etag responses
	 * Automatically sends a 404 and exits if path doesn’t exist or fails a security check
	 *
	 * @param object req
	 * @param object res
	 * @param string contentType
	 * @param Asset asset Asset to compile.  If null, path contents will be ouputed
	 * @param int lastModified If null, filemtime will be used, should return a unix timestamp
	 */
	_process(req, res, contentType, asset = null, lastModified = null) {
		if(req.path.indexOf('..') >= 0) {
			throw new BadRequestError('Invalid asset path')
		}

		// TODO: Check if path exists

		if(lastModified.isNil) {
			// TODO
			lastModified = Date.now() / 1000.0
		}

		const sha1 = crypto.createHash('sha1')
		sha1.update(`${req.path}_${lastModified}`)
		const etag = `"${sha1.digest('hex')}"`

		if(!req.headers.http_if_none_match.isNil && req.headers.http_if_none_match === etag) {
			res.send(304)
			return
		}

		const format = 'ddd, dd mmm yyyy HH:MM:ss Z'
		const expires = new Date((lastModified + 31536000) * 1000.0)
		lastModified = new Date(lastModified * 1000.0)

		return this._compile(this.assetPath(req), asset, res).then(content => {
			res.header('Cache-Control', 'public, max-age=31536000')
			res.header('Expires', dateFormat(expires, format))
			res.header('Last-Modified', dateFormat(lastModified, format))
			res.header('ETag', etag)
			res.header('Content-Type', `${contentType};charset=utf-8`)

			res.send(content)
		}).catch(err => {
			res.status(500)
			res.header('Content-Type', 'text/plain')

			let body = ''

			if(!err.file.isNil) {
				body += err.file

				if(err.line) {
					body += `:${err.line}`

					if(err.column) {
						body += `:${err.column}`
					}
				}

				body += `\n\t`
			}

			body += err.message
			Log.error('Asset compilation error', body)
			res.send(`/*\n${body}\n*/`)
		})
	}

	_compile(pathname, asset, res) {
		if(asset.isNil) {
			return new Promise((resolve, reject) => {
				fs.readFile(pathname, (err, contents) => {
					if(!err.isNil) {
						return reject(err)
					}

					resolve(contents)
				})
			})
		} else {
			res.header('X-Cached', 'false')

			return asset.compile()
		}

	}

	assetPath(req) {
		return path.join(this.resources, req.path)
	}

}
