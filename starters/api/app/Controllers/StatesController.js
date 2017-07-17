import 'App/Controllers/BaseController'

import 'App/Models/StateModel'

export class StatesController extends BaseController {
	model = StateModel

	index(req, res) {
		const { start, end } = this.paginationRange(req)

		return this.model.query().range(start, end).then(rows => {
			if(rows.isNil) {
				throw new NotFoundError('No states found')
			}

			res.send(rows)
		})
	}

	show(req, res) {
		return req.params.state.$loadRelated('[country,companies]').then(state => {
			res.send(state)
		})
	}

	search(req, res) {
		if(req.query.term.isNil || req.query.term.length === 0) {
			throw new BadRequestError('`term` is required')
		}

		const { start, end } = this.paginationRange(req)

		return this.model.find(req.query.term).range(start, end).then(rows => {
			if(rows.isNil) {
				throw new NotFoundError('No states found, try a different term')
			}

			res.send(rows)
		})
	}

}
