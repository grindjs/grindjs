import './ConfigBuilder'

import knex from 'knex'

export function DatabaseBuilder(config, app) {
	return knex(ConfigBuilder(config, app))
}
