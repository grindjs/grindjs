import http from 'http'

import { Application, Kernel } from '@grindjs/framework'

import { ErrorHandler } from './ErrorHandler'
import { RequestExtension } from './Routing/Extensions/RequestExtension'
import { ResponseExtension } from './Routing/Extensions/ResponseExtension'
import { UpgradeDispatcher } from './Routing/UpgradeDispatcher'
import { standardProviders } from '.'

export class HttpKernel extends Kernel {
	public static readonly type = 'http'
	public readonly as = 'http'
	public readonly errorHandler: ErrorHandler

	constructor(app: Application, options: Record<string, any> = {}) {
		super(app, options)

		RequestExtension()
		ResponseExtension()

		const errorHandlerClass: typeof ErrorHandler = options.errorHandlerClass ?? ErrorHandler
		this.errorHandler = new errorHandlerClass(app)
	}

	get providers() {
		return standardProviders
	}

	start(...args: any[]) {
		// Register error handler
		this.app.express!.use(this.errorHandler.handle.bind(this.errorHandler))

		// Register 404 handler
		this.app.express!.use((req, res, next) => {
			this.errorHandler.handle(new NotFoundError(), req, res, next)
		})

		this.app.server = http.createServer(this.app.express)

		// Register upgrade handlers
		const upgrades = this.app.routes?.upgraders
		if (upgrades && Object.keys(upgrades).length > 0) {
			this.app.server.on('upgrade', UpgradeDispatcher.bind(this.app.routes, upgrades))
		}

		this.app.emit('listen', this.app, this.app.server)

		return this.app.server.listen(...args)
	}
}

declare module '@grindjs/framework' {
	interface Application {
		server?: http.Server
	}
}
