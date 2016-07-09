import 'App/Controllers/BaseController'

import 'App/Models/CompanyModel'

export class CompaniesController extends BaseController {
	model = CompanyModel

	index(req, res) {
		return this.model.query().subset(this.pagination(req)).then(rows => {
			if(rows.isNil) {
				throw new NotFoundError('No companies found')
			}

			res.send(rows)
		})
	}

}
