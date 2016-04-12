import {config} from './config'
import {knex} from './knex'

export function provider(app) {
	app.set('db', knex(config(app)))
}
