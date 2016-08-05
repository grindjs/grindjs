import './Config'
import './Controller'
import './ErrorHandler'
import './Errors'
import './HttpServer'
import './Log'
import './Paths'
import './RouteExtension'
import './Router'

import Grind from 'express'

module.exports = function(parameters = { }) {
	RouteExtension()

	const routerClass = parameters.routerClass || Router
	const configClass = parameters.configClass || Config
	const errorHandlerClass = parameters.errorHandlerClass || ErrorHandler

	const grind = Grind()

	grind.env = () => process.env.NODE_ENV || 'local'
	grind.paths = new Paths(module.parent.filename)
	grind.routes = new routerClass(grind)
	grind.config = new configClass(grind)
	grind.port = process.env.NODE_PORT || grind.config.get('app.port', 3000)
	grind.errorHandler = new errorHandlerClass(grind)
	grind.booted = false
	grind.providers = [ ]
	grind.debug = grind.config.get('app.debug', grind.env() === 'local')

	grind.boot = function() {
		if(this.booted) { return }

		for(const provider of this.providers) {
			provider(this)
		}

		this.booted = true
	}

	const listen = grind.listen

	grind.listen = function(...args) {
		this.boot()

		// Register error handler
		this.use((err, req, res, next) => {
			this.errorHandler.handle(err, req, res, next)
		})

		// Register 404 handler
		this.use((req, res, next) => {
			this.errorHandler.handle(new NotFoundError, req, res, next)
		})

		return listen.apply(grind, args)
	}

	return grind
}

module.exports.Config = Config
module.exports.Controller = Controller
module.exports.ErrorHandler = ErrorHandler
module.exports.Errors = Errors
module.exports.HttpServer = HttpServer
module.exports.Router = Router

global.Log = Log
