import './Config'

import knex from 'knex'

export function Database(config, app) {
	return knex(Config(config, app))
}
