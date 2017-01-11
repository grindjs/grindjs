import './ConfigBuilder'

import knex from 'knex'

export function DatabaseBuilder(config, app, configBuilder = null) {
	configBuilder = configBuilder || ConfigBuilder
	return knex(configBuilder(config, app))
}
