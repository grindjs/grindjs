const Layer = require('express/lib/router/layer.js')

export class RouteLayer extends Layer {
	_layer: any

	constructor(route: any, layer: any, middleware: any, options: any) {
		super(route.path, options, layer.handle)

		this.route = route
		this._layer = layer

		route.dispatchMiddleware = (req: any, res: any, done: any) => {
			let idx = 0
			next()

			function next(err?: any) {
				if (err) {
					return done(err)
				}

				const handle = middleware[idx++]

				if (!handle) {
					return done()
				}

				return handle(req, res, next)
			}
		}
	}

	match(path: any) {
		return this._layer.match(path)
	}

	get params() {
		const params = this._layer.params || {}
		params.__middlewareWorkaround = true
		return params
	}

	set params(value) {
		/* Ignore */
	}

	get keys() {
		const keys = (this._layer.keys || []).slice()
		keys.unshift({ name: '__middlewareWorkaround' })
		return keys
	}

	set keys(value) {
		/* Ignore */
	}
}
