export function config(app) {
	var connection = app.config.get('database.default')
	if(!connection) return

	connection = app.config.get('database.connections.' + connection)
	if(!connection) return

	var driver = connection.driver || null
	delete connection.driver

	var dialect = connection.dialect || null
	delete connection.dialect

	var pool = connection.pool || null
	delete connection.pool

	var config = { }

	if(driver) config.client = driver
	if(dialect) config.dialect = dialect
	if(pool) config.pool = pool

	config.connection = connection

	return config
}