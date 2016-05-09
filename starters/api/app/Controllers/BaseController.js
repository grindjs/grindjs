import HttpError from 'http-errors'

export class BaseController {
	app = null
	db = null

	constructor(app) {
		this.app = app
		this.db = app.get('db')
	}

	pagination(req, limit = 100) {
		const offset = Math.max(parseInt(req.query.offset || 0), 0)
		limit = Math.min(Math.max(parseInt(req.query.limit || limit), 1), limit)

		return { limit, offset }
	}

	sendError(code, message) {
		throw new HttpError[code](message)
	}

}
