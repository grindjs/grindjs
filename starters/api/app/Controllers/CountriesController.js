import 'App/Controllers/BaseController'

import 'App/Models/CountryModel'

export class CountriesController extends BaseController {
	model = CountryModel

	index(req, res) {
		const { start, end } = this.paginationRange(req)

		return this.model
			.query()
			.range(start, end)
			.then(rows => {
				if (rows.isNil) {
					throw new NotFoundError('No countries found')
				}

				res.send(rows)
			})
	}

	show(req, res) {
		return req.params.country.$loadRelated('states').then(country => {
			res.send(country)
		})
	}

	search(req, res) {
		if (req.query.term.isNil || req.query.term.length === 0) {
			throw new ValidationError({ term: 'term is required' })
		}

		const { start, end } = this.paginationRange(req)

		return this.model
			.find(req.query.term)
			.range(start, end)
			.then(rows => {
				if (rows.isNil) {
					throw new NotFoundError('No countries found, try a different term')
				}

				res.send(rows)
			})
	}
}
