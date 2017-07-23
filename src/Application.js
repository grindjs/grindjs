import './Config'
import './Paths'
import './ProviderCollection'

import { lazy } from 'grind-support'
const EventEmitter = require('events')

/**
 * Main Application class for Grind
 */
export class Application extends EventEmitter {
	express = null
	_env = null

	config = null
	errorHandler = null
	paths = null
	routes = null
	url = null

	booted = false
	booting = false
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
	 */
	constructor({
		env,
		port,
		routerClass,
		configClass,
		errorHandlerClass,
		urlGeneratorClass,
		pathsClass
	} = { }) {
		super()

		this._env = env

		configClass = configClass || Config
		pathsClass = pathsClass || Paths

		const parent = module.parent.parent === null ? module.parent : (
			module.parent.parent.parent === null ? module.parent.parent : module.parent.parent.parent
		)

		this.paths = new pathsClass(parent.filename)
		this.config = new configClass(this)
		this.providers = new ProviderCollection
		this.debug = this.config.get('app.debug', this.env() === 'local')
		this.on('error', err => Log.error('EventEmitter error', err))

		this.lazy('express', app => {
			const express = require('express/lib/express.js')()
			express.disable('etag')
			express._grind = app
			return express
		})

		// Register lazy loaded properties
		this.lazy('routes', app => {
			if(routerClass.isNil) {
				routerClass = require('./Routing/Router.js').Router
			}

			return app._loadRouting(routerClass)
		})

		this.lazy('errorHandler', app => {
			if(errorHandlerClass.isNil) {
				errorHandlerClass = require('./ErrorHandler.js').ErrorHandler
			}

			return new errorHandlerClass(app)
		})

		this.lazy('url', app => {
			if(urlGeneratorClass.isNil) {
				urlGeneratorClass = require('./UrlGenerator.js').UrlGenerator
			}


			return new urlGeneratorClass(app)
		})

		this.lazy('port', () => port || process.env.NODE_PORT || this.config.get('app.port', 3000))
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

		this.booting = true
		this.providers.sort((a, b) => a.priority > b.priority ? -1 : 1)

		for(const provider of this.providers) {
			await provider(this)
		}

		this.emit('boot', this)

		this.booted = true
		this.booting = false
	}

	/**
	 * Starts the HTTP server
	 * @return {object} HTTP server instance
	 */
	async listen(...args) {
		this.routes // Ensure the router is lazy loaded before we boot
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
			const { UpgradeDispatcher } = require('./Routing/UpgradeDispatcher')
			this.server.on('upgrade', UpgradeDispatcher.bind(this.routes, this.routes.upgraders))
		}

		this.emit('listen', this, this.server)

		return this.server.listen(...args)
	}

	/**
	 * Shuts down the current application, if booted.
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
	 * Setups up the application to handle routing
	 *
	 * @param  {Class}  routerClass Class or subclass of Router
	 * @return {Object}             Instance of routerClass
	 */
	_loadRouting(routerClass) {
		const { RequestExtension } = require('./Routing/Extensions/RequestExtension.js')
		const { ResponseExtension } = require('./Routing/Extensions/ResponseExtension.js')
		const { RouteExtension } = require('./Routing/Extensions/RouteExtension.js')

		RequestExtension()
		ResponseExtension()
		RouteExtension()

		const router = new routerClass(this)

		if(this.booted || this.booting) {
			router.boot()
		} else {
			const boot = router.boot.bind(router)
			boot.priority = 35000
			this.providers.add(boot)
		}

		return router
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
		lazy(this, name, callback)
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
