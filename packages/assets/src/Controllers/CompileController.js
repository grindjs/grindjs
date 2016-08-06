import '../Support/FS'

import path from 'path'
import crypto from 'crypto'
import dateFormat from 'dateformat'

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

		const asset = this.factory.make(pathname)
		const lastModified = await asset.lastModified()

		const sha1 = crypto.createHash('sha1')
		sha1.update(`${pathname}_${lastModified}`)
		const etag = `"${sha1.digest('hex')}"`

		if(!req.headers.http_if_none_match.isNil && req.headers.http_if_none_match === etag) {
			res.send(304)
			return
		}

		const expires = new Date((lastModified + 31536000) * 1000.0)
		const lastModifiedDate = new Date(lastModified * 1000.0)

		res.header('X-Cached', 'false')
		return asset.compile().then(content => {
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

			body += `\n\t`
		}

		body += err.message

		return body
	}

}
