import {BaseController} from 'app/controllers/base'
import {StatesRepository} from 'app/repositories/states'

export class StatesController extends BaseController {
	repo = null

	constructor(app) {
		super(app)

		this.repo = new StatesRepository(this.db)
	}

	index(req, res) {
		const { limit, offset } = this.pagination(req)

		this.repo.all(limit, offset, (rows) => {
			if(rows != null) {
				res.send(rows)
			} else {
				this.sendError(res, 404, 'No states found')
			}
		})
	}

	show(req, res) {
		const { limit, offset } = this.pagination(req)

		this.repo.find(req.params.abbr.toUpperCase(), (row) => {
			if(row) {
				res.send(row)
			} else {
				this.sendError(res, 404, 'State not found')
			}
		})
	}

	search(req, res) {
		if(!req.query.term || req.query.term.length == 0) {
			this.sendError(res, 400, '`term` is required')
			return
		}

		const { limit, offset } = this.pagination(req)

		this.repo.all(limit, offset, req.query.term, (rows) => {
			if(rows != null) {
				res.send(rows)
			} else {
				this.sendError(res, 404, 'No states found, try a different term')
			}
		})
	}

}