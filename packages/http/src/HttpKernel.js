import { Kernel } from 'grind-framework'
import { standardProviders, ErrorHandler } from './index.js'

import './Routing/UpgradeDispatcher'

const { RequestExtension } = require('./Routing/Extensions/RequestExtension.js')
const { ResponseExtension } = require('./Routing/Extensions/ResponseExtension.js')

export class HttpKernel extends Kernel {

	static type = 'http'
	as = 'http'

	constructor(app, options) {
		super(app, options)

		RequestExtension()
		ResponseExtension()

		const errorHandlerClass = options.errorHandlerClass || ErrorHandler
		this.errorHandler = new errorHandlerClass(app)
	}

	get providers() {
		return standardProviders
	}

	start(...args) {
		// Register error handler
		this.app.express.use(this.errorHandler.handle.bind(this.errorHandler))

		// Register 404 handler
		this.app.express.use((req, res, next) => {
			this.errorHandler.handle(new NotFoundError, req, res, next)
		})

		this.app.server = require('http').createServer(this.app.express)

		// Register upgrade handlers
		if(Object.keys(this.app.routes.upgraders).length > 0) {
			this.app.server.on('upgrade', UpgradeDispatcher.bind(this.app.routes, this.app.routes.upgraders))
		}

		this.app.emit('listen', this.app, this.app.server)

		return this.app.server.listen(...args)
	}

}
