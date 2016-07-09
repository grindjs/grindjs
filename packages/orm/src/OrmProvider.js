import './Model'
import './QueryBuilder'

import { ValidationError } from 'objection'

export function OrmProvider(app) {
	Model.app(app)
	Model.knex(app.get('db'))

	Model.QueryBuilder = QueryBuilder
	Model.RelatedQueryBuilder = QueryBuilder

	global.ValidationError = ValidationError
}
