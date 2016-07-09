export function Config(app) {
	let connection = app.config.get('database.default')

	if(connection.isNil) {
		return
	}

	connection = app.config.get('database.connections.' + connection)

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
		config = Object.assign({ }, config, connection)
	} else {
		config.connection = connection
	}

	return config
}