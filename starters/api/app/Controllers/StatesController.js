import 'App/Controllers/BaseController'
import 'App/Repositories/StatesRepository'

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
				this.sendError(404, 'No states found')
			}
		})
	}

	show(req, res) {
		res.send(req.params.state)
	}

	search(req, res) {
		if(!req.query.term || req.query.term.length == 0) {
			this.sendError(400, '`term` is required')
			return
		}

		const { limit, offset } = this.pagination(req)

		this.repo.all(limit, offset, req.query.term, (rows) => {
			if(rows != null) {
				res.send(rows)
			} else {
				this.sendError(404, 'No states found, try a different term')
			}
		})
	}

}