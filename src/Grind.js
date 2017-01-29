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
		this.express.use((err, req, res, next) => {
			this.errorHandler.handle(err, req, res, next)
		})

		// Register 404 handler
		this.express.use((req, res, next) => {
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

			try {
				await provider.shutdown(this)
			} catch(e) {
				Log.error(`Error while shutting ${provider.name} down`, e)
			}
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
module.exports.UrlGenerator = UrlGenerator

global.Log = Log
