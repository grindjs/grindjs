import Application from '@grindjs/framework'
import Knex from 'knex'

export interface Config {
	driver?: string
	dialect?: string
	user?: string
	password?: string
	host?: string
	port?: number | string
	db?: string
	database?: string
	connection?: string | Knex.StaticConnectionConfig
	pool?: Knex.PoolConfig
	useNullAsDefault?: boolean
}

export interface ConfigBuilderType {
	(connection: Config | string | null | undefined, app: Application): Knex.Config | null
}

const ConfigBuilder: ConfigBuilderType = function (connection, app) {
	if (typeof connection === 'string') {
		connection = app.config.get(`database.connections.${connection}`) as Config | undefined
	}

	if (connection === null || connection === undefined) {
		return null
	}

	const driver = connection.driver || null
	delete connection.driver

	const dialect = connection.dialect || null
	delete connection.dialect

	const pool = connection.pool || null
	delete connection.pool

	const useNullAsDefault = connection.useNullAsDefault
	delete connection.useNullAsDefault

	let config: Knex.Config = {}

	if (typeof driver === 'string') {
		config.client = driver
	}

	if (typeof dialect === 'string') {
		config.dialect = dialect
	}

	if (pool !== null && pool !== undefined) {
		config.pool = pool
	}

	if (typeof useNullAsDefault === 'boolean') {
		config.useNullAsDefault = useNullAsDefault
	}

	if (config.client === 'pg' || config.client === 'postgres' || config.client === 'postgresql') {
		if (connection.connection === null || connection.connection == undefined) {
			connection.connection = 'postgres://'

			if (typeof connection.user === 'string') {
				connection.connection += connection.user

				if (typeof connection.password === 'string') {
					connection.connection += `:${connection.password}`
				}

				connection.connection += '@'
			}

			connection.connection += connection.host || 'localhost'

			if (typeof connection.port === 'number' || typeof connection.port === 'string') {
				connection.connection += `:${connection.port}`
			}

			if (typeof connection.db === 'string') {
				connection.connection += `/${connection.db}`
			} else if (typeof connection.database === 'string') {
				connection.connection += `/${connection.database}`
			}
		}

		config = Object.assign({}, config, connection)
	} else {
		config.connection = connection as any
	}

	config.seeds = {
		directory: app.paths.base('database', 'seeds'),
	}

	config.migrations = {
		directory: app.paths.base('database', 'migrations'),
	}

	return config
}

export { ConfigBuilder }
