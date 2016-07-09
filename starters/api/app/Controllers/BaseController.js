export class BaseController {
	app = null
	db = null

	constructor(app) {
		this.app = app
		this.db = app.get('db')
	}

	pagination(req, limit = 100) {
		const offset = Math.max(Number.parseInt(req.query.offset || 0), 0)
		limit = Math.min(Math.max(Number.parseInt(req.query.limit || limit), 1), limit)

		return { limit, offset }
	}

	abort(code, message, next) {
		const error = HttpError.make(code, message)

		if(next.isNil) {
			throw error
		}

		next(error)
	}

}
