import './Config'
import knex from 'knex'

export function Provider(app) {
	app.set('db', knex(Config(app)))
}
