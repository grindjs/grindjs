export function Config(app) {
	var connection = app.config.get('database.default')
	if(connection.isNil) return

	connection = app.config.get('database.connections.' + connection)
	if(connection.isNil) return

	var driver = connection.driver || null
	delete connection.driver

	var dialect = connection.dialect || null
	delete connection.dialect

	var pool = connection.pool || null
	delete connection.pool

	var useNullAsDefault = connection.useNullAsDefault || null
	delete connection.useNullAsDefault

	var config = { }

	if(!driver.isNil) config.client = driver
	if(!dialect.isNil) config.dialect = dialect
	if(!pool.isNil) config.pool = pool
	if(!useNullAsDefault.isNil) config.useNullAsDefault = useNullAsDefault

	if(config.client === 'pg' || config.client === 'postgres' || config.client === 'postgresql') {
		config = Object.assign({ }, config, connection)
	} else {
		config.connection = connection
	}

	return config
}
