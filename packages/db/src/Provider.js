import {Config} from './Config'
import {Knex} from './Knex'

export function Provider(app) {
	app.set('db', Knex(Config(app)))
}
