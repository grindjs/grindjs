import './Config'
import './Controller'
import './ErrorHandler'
import './Errors'
import './HttpServer'
import './Log'
import './Paths'
import './ProviderCollection'
import './RouteExtension'
import './Router'
import './UrlGenerator'

import Express from 'express'

export default class Grind {
	express = null

	config = null
	errorHandler = null
	paths = null
	routes = null
	url = null

	booted = false
	port = 3000
	providers = null

	constructor(parameters = { }) {
		RouteExtension()

		this.express = Express()
		this.express.disable('etag')

		const routerClass = parameters.routerClass || Router
		const configClass = parameters.configClass || Config
		const errorHandlerClass = parameters.errorHandlerClass || ErrorHandler
		const urlGeneratorClass = parameters.urlGeneratorClass || UrlGenerator
		const pathsClass = parameters.pathsClass || Paths

		this.paths = new pathsClass(module.parent.filename)
		this.routes = new routerClass(this)
		this.config = new configClass(this)
		this.errorHandler = new errorHandlerClass(this)
		this.providers = new ProviderCollection

		this.debug = this.config.get('app.debug', this.env() === 'local')
		this.port = process.env.NODE_PORT || this.config.get('app.port', 3000)

		this.url = new urlGeneratorClass(this)
	}

	env() {
		return process.env.NODE_ENV || 'local'
	}

	boot() {
		if(this.booted) {
			return
		}

		this.providers.sort((a, b) => a.priority > b.priority ? -1 : 1)

		for(const provider of this.providers) {
			provider(this)
		}

		this.booted = true
	}

	listen(...args) {
		this.boot()

		// Register error handler
		this.use((err, req, res, next) => {
			this.errorHandler.handle(err, req, res, next)
		})

		// Register 404 handler
		this.use((req, res, next) => {
			this.errorHandler.handle(new NotFoundError, req, res, next)
		})

		return this.express.listen(...args)
	}

	// Proxies to express
	use(...args) { return this.express.use(...args) }
	enable(...args) { return this.express.enable(...args) }
	disable(...args) { return this.express.disable(...args) }

}

module.exports.Config = Config
module.exports.Controller = Controller
module.exports.ErrorHandler = ErrorHandler
module.exports.Errors = Errors
module.exports.HttpServer = HttpServer
module.exports.Paths = Paths
module.exports.Router = Router

global.Log = Log
