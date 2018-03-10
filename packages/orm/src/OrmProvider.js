import './Model'
import './QueryBuilder'

import { ValidationError } from 'objection'

export function OrmProvider(app) {
	Model.app(app)
	Model.knex(app.db)

	Model.QueryBuilder = QueryBuilder
	Model.RelatedQueryBuilder = QueryBuilder

	global.ValidationError = ValidationError

	if(app.http.isNil) {
		return
	}

	app.http.errorHandler.shouldntReport.push(ValidationError)
	app.http.errorHandler.register(ValidationError, err => {
		const violators = Object.keys(err.data || { })
		return {
			code: err.statusCode || 400,
			error: violators.length === 1 ? err.data[violators] : 'Validation error',
			violations: err.data
		}
	})
}

OrmProvider.priority = 40000
