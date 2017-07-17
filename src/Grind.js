import './Config'
import './ErrorHandler'
import './Paths'
import './ProviderCollection'
import './UrlGenerator'

import './Routing/Router'
import './Routing/RoutingProvider'
import './Routing/UpgradeDispatcher'

import './Routing/Extensions/RequestExtension'
import './Routing/Extensions/ResponseExtension'
import './Routing/Extensions/RouteExtension'

const Express = require('express/lib/express.js')
const EventEmitter = require('events')

/**
 * Main Application class for Grind
 */
export class Grind extends EventEmitter {
	express = null
	_env = null

	config = null
	errorHandler = null
	paths = null
	routes = null
	url = null

	booted = false
	port = 3000
	providers = null

	/**
	 * Create an instance of the Grind Application
	 *
	 * @param  {string}   options.env               Override env name
	 *                                              By default, env is populated by the NODE_ENV
	 *                                              environment variable. This value takes
	 *                                              precedence over all other values.
	 * @param  {integer}  options.port              Override port to listen on
	 *                                              By default, port is populated by the app.port
	 *                                              config value, with an optional override via the
	 *                                              NODE_PORT environment variable.  This value
	 *                                              takes precedence over all other values.
	 * @param  {Class}   options.routerClass        Override for Router class
	 * @param  {Class}   options.configClass        Override for Config class
	 * @param  {Class}   options.errorHandlerClass  Override for ErrorHandler class
	 * @param  {Class}   options.urlGeneratorClass  Override for UrlGenerator class
	 * @param  {Class}   options.pathsClass         Override for Paths class
	 * @param  {Function} options.routingProvider   Override for RoutingProvider
	 */
	constructor({
		env,
		port,
		routerClass,
		configClass,
		errorHandlerClass,
		urlGeneratorClass,
		pathsClass,
		routingProvider
	} = { }) {
		RequestExtension()
		ResponseExtension()
		RouteExtension()

		super()

		this.express = Express()
		this.express.disable('etag')
		this.express._grind = this

		this._env = env

		routerClass = routerClass || Router
		configClass = configClass || Config
		errorHandlerClass = errorHandlerClass || ErrorHandler
		urlGeneratorClass = urlGeneratorClass || UrlGenerator
		pathsClass = pathsClass || Paths

		routingProvider = routingProvider || RoutingProvider
		routingProvider.priority = RoutingProvider.priority

		const parent = module.parent.parent === null ? module.parent : (
			module.parent.parent.parent === null ? module.parent.parent : module.parent.parent.parent
		)

		this.paths = new pathsClass(parent.filename)
		this.config = new configClass(this)
		this.routes = new routerClass(this)
		this.errorHandler = new errorHandlerClass(this)

		this.providers = new ProviderCollection
		this.providers.add(routingProvider)

		this.debug = this.config.get('app.debug', this.env() === 'local')
		this.port = port || process.env.NODE_PORT || this.config.get('app.port', 3000)

		this.url = new urlGeneratorClass(this)

		this.on('error', err => Log.error('EventEmitter error', err))
	}

	/**
	 * @return {string} Current environment
	 */
	env() {
		return this._env || process.env.NODE_ENV || 'local'
	}

	/**
	 * Boots the current application, if not already booted.
	 * This will notify all registered providers and start them.
	 *
	 * @return {Promise}
	 */
	async boot() {
		if(this.booted) {
			return
		}

		this.providers.sort((a, b) => a.priority > b.priority ? -1 : 1)

		for(const provider of this.providers) {
			await provider(this)
		}

		this.emit('boot', this)

		this.booted = true
	}

	/**
	 * Starts the HTTP server
	 * @return {object} HTTP server instance
	 */
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

		this.server = require('http').createServer(this.express)

		// Register upgrade handlers
		if(Object.keys(this.routes.upgraders).length > 0) {
			this.server.on('upgrade', UpgradeDispatcher.bind(this.routes, this.routes.upgraders))
		}

		this.emit('listen', this, this.server)

		return this.server.listen(...args)
	}

	/**
	 * Shutsdown the current application, if booted.
	 * This will notify all registered providers with a shutdown handler.
	 *
	 * @return {Promise}
	 */
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

		this.emit('shutdown', this)

		this.booted = false
	}

	/**
	 * Register a property on the app instance that will be
	 * populated with the value of `callback` after the first
	 * time it’s called.
	 *
	 * @param  {string}   name     Name of the property to registe
	 * @param  {Function} callback Callback handler that should return
	 *                             the value of the property
	 */
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

	/**
	 * Passthrough for express.enable()
	 */
	enable(...args) {
		return this.express.enable(...args)
	}

	/**
	 * Passthrough for express.disable()
	 */
	disable(...args) {
		return this.express.disable(...args)
	}

}
