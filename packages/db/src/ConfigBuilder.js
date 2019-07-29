export function ConfigBuilder(connection, app) {
	if(typeof connection === 'string') {
		connection = app.config.get(`database.connections.${connection}`)
	}

	if(connection.isNil) {
		return
	}

	const driver = connection.driver || null
	delete connection.driver

	const dialect = connection.dialect || null
	delete connection.dialect

	const pool = connection.pool || null
	delete connection.pool

	const useNullAsDefault = connection.useNullAsDefault || null
	delete connection.useNullAsDefault

	let config = { }

	if(!driver.isNil) {
		config.client = driver
	}

	if(!dialect.isNil) {
		config.dialect = dialect
	}

	if(!pool.isNil) {
		config.pool = pool
	}

	if(!useNullAsDefault.isNil) {
		config.useNullAsDefault = useNullAsDefault
	}

	if(config.client === 'pg' || config.client === 'postgres' || config.client === 'postgresql') {
		if(connection.connection.isNil) {
			connection.connection = 'postgres://'

			if(!connection.user.isNil) {
				connection.connection += connection.user

				if(!connection.password.isNil) {
					connection.connection += `:${connection.password}`
				}

				connection.connection += '@'
			}

			connection.connection += connection.host || 'localhost'

			if(!connection.port.isNil) {
				connection.connection += `:${connection.port}`
			}

			if(!connection.db.isNil) {
				connection.connection += `/${connection.db}`
			} else if(!connection.database.isNil) {
				connection.connection += `/${connection.database}`
			}
		}

		config = Object.assign({ }, config, connection)
	} else {
		config.connection = connection
	}

	config.seeds = {
		directory: app.paths.base('database', 'seeds')
	}

	config.migrations = {
		directory: app.paths.base('database', 'migrations')
	}

	return config
}
