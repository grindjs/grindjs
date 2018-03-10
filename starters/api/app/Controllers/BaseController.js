import { Controller } from 'grind-framework'

export class BaseController extends Controller {

	db = null

	constructor(app) {
		super(app)

		this.db = app.db
	}

	pagination(req, limit = 100) {
		const offset = Math.max(Number.parseInt(req.query.offset || 0), 0)
		limit = Math.min(Math.max(Number.parseInt(req.query.limit || limit), 1), limit)

		return { limit, offset }
	}

	paginationRange(req, limit = 100) {
		const pagination = this.pagination(req, limit)
		return { start: pagination.offset, end: (pagination.limit + pagination.offset) - 1 }
	}

}
