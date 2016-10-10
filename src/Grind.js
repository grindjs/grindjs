import './Config'
import './Controller'
import './ErrorHandler'
import './Errors'
import './HttpServer'
import './Log'
import './Paths'
import './ProviderCollection'
import './Router'
import './UrlGenerator'

import './Extensions/RouteExtension'
import './Extensions/ResponseExtension'

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
		ResponseExtension()

		this.express = Express()
		this.express.disable('etag')
		this.express._grind = this

		const routerClass = parameters.routerClass || Router
		const configClass = parameters.configClass || Config
		const errorHandlerClass = parameters.errorHandlerClass || ErrorHandler
		const urlGeneratorClass = parameters.urlGeneratorClass || UrlGenerator
		const pathsClass = parameters.pathsClass || Paths

		this.paths = new pathsClass(module.parent.filename)
		this.config = new configClass(this)
		this.routes = new routerClass(this)
		this.errorHandler = new errorHandlerClass(this)
		this.providers = new ProviderCollection

		this.debug = this.config.get('app.debug', this.env() === 'local')
		this.port = process.env.NODE_PORT || this.config.get('app.port', 3000)

		this.url = new urlGeneratorClass(this)
	}

	env() {
		return process.env.NODE_ENV || 'local'
	}

	async boot() {
		if(this.booted) {
			return
		}

		this.providers.sort((a, b) => a.priority > b.priority ? -1 : 1)

		for(const provider of this.providers) {
			await provider(this)
		}

		this.booted = true
	}

	async listen(...args) {
		await this.boot()

		// Register error handler
		this.routes.use((err, req, res, next) => {
			this.errorHandler.handle(err, req, res, next)
		})

		// Register 404 handler
		this.routes.use((req, res, next) => {
			this.errorHandler.handle(new NotFoundError, req, res, next)
		})

		return this.express.listen(...args)
	}

	async shutdown() {
		if(!this.booted) {
			return
		}

		for(const provider of this.providers) {
			if(typeof provider.shutdown !== 'function') {
				continue
			}

			await provider.shutdown(this)
		}

		this.booted = false
	}

	lazy(name, callback) {
		Object.defineProperty(this, name, {
			configurable: true,
			get: () => {
				const value = callback(this)

				Object.defineProperty(this, name, {
					value: value,
					writeable: false
				})

				return value
			}
		})
	}

	// Proxies to express
	use(...args) {
		try {
			throw new Error('app.use is deprecated as of 0.5 and will be removed in 0.6')
		} catch(err) {
			const stack = err.stack.split(/\n/).slice(2)
			stack.unshift('')
			Log.error(err.message, stack.join(`\n`))
		}

		return this.routes.use(...args)
	}

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
