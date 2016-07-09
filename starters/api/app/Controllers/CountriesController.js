import 'App/Controllers/BaseController'

import 'App/Models/CountryModel'

export class CountriesController extends BaseController {
	model = CountryModel

	index(req, res) {
		return this.model.query().subset(this.pagination(req)).then(rows => {
			if(rows.isNil) {
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
		if(req.query.term.isNil || req.query.term.length === 0) {
			throw new ValidationError({ term: 'term is required' })
		}

		return this.model.find(req.query.term).subset(this.pagination(req)).then(rows => {
			if(rows.isNil) {
				throw new NotFoundError('No countries found, try a different term')
			}

			res.send(rows)
		})
	}

}
