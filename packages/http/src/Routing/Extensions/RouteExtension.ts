const Route = require('express/lib/router/route.js')

type NextHandleFunction = import('../Router').NextHandleFunction

export function RouteExtension() {
	if (Route._grindHasExtended) {
		return
	}

	Route._grindHasExtended = true

	Route.prototype._addMiddleware = function (
		source: string,
		prepend: boolean,
		...handlers: NextHandleFunction[]
	) {
		if (handlers.length === 1 && Array.isArray(handlers[0])) {
			handlers = handlers[0] as any
		}

		if (prepend) {
			handlers = handlers.reverse()
		}

		const methods = this.methods

		if (methods.length === 0) {
			throw new Error(`Route.${source}() requires at least one method to be registered.`)
		}

		if (this.stack.length === 0) {
			throw new Error(`Route.${source}() requires at least one handler already be added.`)
		}

		const LayerClass = this.stack[0].constructor

		for (const [method, enabled] of Object.entries(methods)) {
			if (!enabled) {
				continue
			}

			for (const handler of handlers) {
				if (typeof handler !== 'function') {
					throw new TypeError(
						`Route.${source}() requires callback functions but got a ${typeof handler}`,
					)
				}

				const layer = LayerClass('/', {}, handler)
				layer.method = method

				if (prepend) {
					this.stack.unshift(layer)
				} else {
					this.stack.push(layer)
				}
			}
		}

		return this
	}

	Route.prototype.before = function (...handlers: NextHandleFunction[]) {
		return this._addMiddleware('before', true, ...handlers)
	}

	Route.prototype.after = function (...handlers: NextHandleFunction[]) {
		return this._addMiddleware('after', false, ...handlers)
	}

	Route.prototype.as = function (name: string) {
		this.grindRouter.nameRoute(name, this)
		return this
	}
}

declare module 'express' {
	interface IRoute {
		as(name: string): IRoute
		before(...handlers: NextHandleFunction[]): IRoute
		after(...handlers: NextHandleFunction[]): IRoute
		grindRouter: import('../Router').Router
		context: any
		routeName?: string
	}
}

declare module 'express-serve-static-core' {
	interface IRoute {
		as(name: string): IRoute
		before(...handlers: NextHandleFunction[]): IRoute
		after(...handlers: NextHandleFunction[]): IRoute
		grindRouter: import('../Router').Router
		context: any
		routeName?: string
	}
}
