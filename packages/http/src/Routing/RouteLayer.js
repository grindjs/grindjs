const Layer = require('express/lib/router/layer.js')

export class RouteLayer extends Layer {

	_layer = null

	constructor(route, layer, middleware, options) {
		super(route.path, options, layer.handle)

		this.route = route
		this._layer = layer

		route.dispatchMiddleware = (req, res, done) => {
			let idx = 0
			next()

			function next(err) {
				if(err) {
					return done(err)
				}

				const handle = middleware[idx++]

				if(!handle) {
					return done()
				}

				return handle(req, res, next)
			}
		}
	}

	match(path) {
		return this._layer.match(path)
	}

	get params() {
		const params = this._layer.params || { }
		params.__middlewareWorkaround = true
		return params
	}

	set params(value) { /* Ignore */ }

	get keys() {
		const keys = (this._layer.keys || [ ]).slice()
		keys.unshift({ name: '__middlewareWorkaround' })
		return keys
	}

	set keys(value) { /* Ignore */ }

}
