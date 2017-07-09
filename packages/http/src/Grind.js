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

	constructor(parameters = { }) {
		RequestExtension()
		ResponseExtension()
		RouteExtension()

		super()

		this.express = Express()
		this.express.disable('etag')
		this.express._grind = this

		this._env = parameters.env

		const routerClass = parameters.routerClass || Router
		const configClass = parameters.configClass || Config
		const errorHandlerClass = parameters.errorHandlerClass || ErrorHandler
		const urlGeneratorClass = parameters.urlGeneratorClass || UrlGenerator
		const pathsClass = parameters.pathsClass || Paths

		const routingProvider = parameters.routingProvider || RoutingProvider
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
		this.port = parameters.port || process.env.NODE_PORT || this.config.get('app.port', 3000)

		this.url = new urlGeneratorClass(this)

		this.on('error', err => Log.error('EventEmitter error', err))
	}

	env() {
		return this._env || process.env.NODE_ENV || 'local'
	}

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
