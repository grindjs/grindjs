module.exports = (app) ->

	app.use (req, res, next) ->
		res.setHeader 'Access-Control-Allow-Origin', '*'
		return next()

	app.get '/swagger.json', (req, res) ->
		stack = app._router?.stack

		unless stack?.length > 0
			console.error 'You haven’t registered any routes yet.'
			process.exit 1

		path = require 'path'
		root = require('find-root')(path.dirname(require.main.filename))
		info = require root + '/package.json'

		paths = { }

		for route in stack
			route = route.route
			continue if not route

			swagger = route.extra?.swagger
			path = route.path
			method = route.methods

			if method and Object.keys(method)?.length > 0
				method = Object.keys(method)[0]
			else
				method = null

			continue if not swagger or not path or not method

			path = path.replace /:([a-z0-0_\-\.]+)/, '{$1}'
			obj = paths[path] or { }
			obj[method] = swagger
			paths[path] = obj

		swagger =
			swagger: '2.0'
			info:
				version: info.version or '0.0.1'
				title: info.name
			basePath: '/'
			host: req.get 'Host'
			schemes: [ 'http' ]
			consumes: [ 'application/json' ]
			produces: [ 'application/json' ]
			paths: paths

		res.setHeader 'Access-Control-Allow-Origin', '*'
		res.send swagger
