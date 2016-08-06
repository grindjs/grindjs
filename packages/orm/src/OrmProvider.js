import './Model'
import './QueryBuilder'
import './MakeModelCommand'

import { ValidationError } from 'objection'

export function OrmProvider(app) {
	Model.app(app)
	Model.knex(app.get('db'))

	Model.QueryBuilder = QueryBuilder
	Model.RelatedQueryBuilder = QueryBuilder

	app.errorHandler.shouldntReport.push(ValidationError)
	app.errorHandler.register(ValidationError, err => {
		const violators = Object.keys(err.data || { })
		return {
			code: err.statusCode || 400,
			error: violators.length === 1 ? err.data[violators] : 'Validation error',
			violations: err.data
		}
	})

	global.ValidationError = ValidationError

	if(app.cli.isNil) {
		return
	}

	app.cli.register(MakeModelCommand)
}

OrmProvider.priority = 40000
