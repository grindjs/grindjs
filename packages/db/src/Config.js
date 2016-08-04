export function Config(connection, app) {
	if(typeof connection === 'string') {
		connection = app.config.get('database.connections.' + connection)
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
