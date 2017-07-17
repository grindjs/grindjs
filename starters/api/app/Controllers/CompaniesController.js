import 'App/Controllers/BaseController'

import 'App/Models/CompanyModel'

export class CompaniesController extends BaseController {
	model = CompanyModel

	index(req, res) {
		const { start, end } = this.paginationRange(req)

		return this.model.query().range(start, end).then(rows => {
			if(rows.isNil) {
				throw new NotFoundError('No companies found')
			}

			res.send(rows)
		})
	}

}
