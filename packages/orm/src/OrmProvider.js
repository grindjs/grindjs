import './Model'

import { ValidationError } from 'objection'

export function OrmProvider(app) {
	Model.app(app)
	Model.knex(app.get('db'))
	global.ValidationError = ValidationError
}
