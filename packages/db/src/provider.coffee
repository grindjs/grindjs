module.exports = (app) ->
	connection = app.config.get 'database.default'
	return if not connection

	connection = app.config.get 'database.connections.' + connection
	return if not connection

	driver = connection.driver or null
	delete connection.driver

	dialect = connection.dialect or null
	delete connection.dialect

	pool = connection.pool or null
	delete connection.pool

	config = { }
	config.client = driver if driver?
	config.dialect = dialect if dialect?
	config.pool = pool if pool?
	config.connection = connection

	db = require('knex')(config)

	app.set 'db', db

	return
