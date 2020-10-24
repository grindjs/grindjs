import Application from '@grindjs/framework'
import knex from 'knex'

import { Config, ConfigBuilder, ConfigBuilderType } from './ConfigBuilder'

export interface DatabaseBuilderFunc {
	(
		config: Config | string | null | undefined,
		app: Application,
		configBuilder?: ConfigBuilderType | null | undefined,
	): knex
}

const DatabaseBuilder: DatabaseBuilderFunc = function (config, app, configBuilder) {
	configBuilder = configBuilder ?? ConfigBuilder
	const connection = configBuilder(config, app)

	if (!connection) {
		throw new Error('Invalid database configuration.')
	}

	return knex(connection)
}

export { DatabaseBuilder }
