module.exports = (app) ->

	app.routes.get '/', (req, res) ->
		res.redirect 301, '/states'
		return

	app.routes.group { prefix: '/states', controller: make('../controllers/states', app) }, ->
		app.routes.get '/', 'index'
		app.routes.get '/search', 'search'
		app.routes.get '/:abbr', 'show'
		return
