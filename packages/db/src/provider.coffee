module.exports = (app) ->
	config = require('./config')(app)
	db = require('./knex')(config)

	app.set 'db', db

	return
