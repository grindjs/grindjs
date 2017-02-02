/* eslint-disable max-lines */
import './ResourceRouteBuilder'
import './RouteLayer'

import bodyParser from 'body-parser'
import path from 'path'
import express from 'express'

export class Router {
	app = null
	bindings = { }
	patterns = { }
	namedRoutes = { }
	middleware = { }
	router = null
	bodyParserMiddleware = [ ]
	resourceRouteBuilderClass = ResourceRouteBuilder

	_scope = [
		{
			prefix: '/',
			action: {
				before: [ ],
				after: [ ]
			}
		}
	]

	get _scopedAction() {
		return this._scope[this._scope.length - 1].action
	}

	get _scopedPrefix() {
		return this._scope[this._scope.length - 1].prefix
	}

	constructor(app) {
		this.app = app
		this.router = express.Router()
		this.app.express.use(this.router)

		this.router.param('__middlewareWorkaround', (req, res, next) => {
			req.route.dispatchMiddleware(req, res, next)
		})
	}

	boot() {
		const bodyParsersConfig = this.app.config.get('routing.body_parsers') || { }
		const parsers = bodyParsersConfig.default || [ 'json', 'form' ]
		const options = bodyParsersConfig.options || { }

		if(!Array.isArray(parsers)) {
			this.bodyParserMiddleware = parsers.isNil ? [ ] : [ parsers ]
		} else {
			this.bodyParserMiddleware = parsers
		}

		this.middleware.json = bodyParser.json(options.json || { })
		this.middleware.form = bodyParser.urlencoded(options.form || { extended: true })
	}

	group(options, callback) {
		if(typeof options === 'function') {
			callback = options
			options = { }
		}

		if(!options.controller.isNil && typeof options.controller === 'function') {
			options.controller = new options.controller(this.app)
		}

		const before = makeArray(options.before)
		const after = makeArray(options.after)

		if(!options.use.isNil) {
			Log.error('WARNING: The `use` parameter in Router.group has been deprecated and will be removed in 0.7')
			Log.error('--> Please use Please use `before` and `after` insead.')

			if(Array.isArray(options.use) || typeof options.use !== 'object') {
				options.use = { before: options.use }
			}

			before.push(...makeArray(options.use.before))
			after.push(...makeArray(options.use.after))
		}

		const parentAction = this._scopedAction
		const scope = {
			prefix: path.join(this._scopedPrefix, this._normalizePathComponent(options.prefix || '/')),
			action: {
				...this._scopedAction,
				before: [ ...parentAction.before, ...before ],
				after: [ ...parentAction.after, ...after ]
			}
		}

		if(!options.controller.isNil) {
			scope.action.controller = options.controller
		}

		this._scope.push(scope)
		callback(this, options.controller)
		this._scope.pop()

		return this
	}

	all(pathname, action) {
		Log.error('Router.all is deprecated and will be removed in 0.7. Offending route: %s', pathname)
		return this.app.express.all(this._scopedPrefix + pathname, this._makeAction(action))
	}

	use(...middleware) {
		if(middleware.length > 1 && typeof middleware[0] === 'string') {
			Log.error('WARNING: Passing a path to Router.use() has been deprecated and will be removed in 0.7.')
			Log.error('--> Please use a route group instead.', middleware[0])

			return this.group({ prefix: middleware.shift() }, routes => {
				routes.use(...middleware)
			})
		}

		if(this._scope.length === 1) {
			this.router.use(...middleware)
		} else {
			this._scopedAction.before.push(...middleware)
		}

		return this
	}

	static(pathname, filePath, options) {
		pathname = this._normalizePathComponent(pathname)

		if(filePath.isNil) {
			filePath = path.join(this._scopedPrefix, pathname)
			filePath = this.app.paths.public(filePath)
		} else if(filePath.substring(0, 1) !== '/') {
			filePath = this.app.paths.public(filePath)
		}

		const action = this._scopedAction
		const handlers = this.resolveHandlers([
			...action.before,
			express.static(filePath, options),
			...action.after
		])

		this.router.use(path.join(this._scopedPrefix, pathname), ...handlers)

		return this
	}

	get(pathname, action, context) {
		return this.addRoute('get', pathname, action, context)
	}

	post(pathname, action, context) {
		return this.addRoute('post', pathname, action, context)
	}

	put(pathname, action, context) {
		return this.addRoute('put', pathname, action, context)
	}

	patch(pathname, action, context) {
		return this.addRoute('patch', pathname, action, context)
	}

	delete(pathname, action, context) {
		return this.addRoute('delete', pathname, action, context)
	}

	options(pathname, action, context) {
		return this.addRoute('options', pathname, action, context)
	}

	head(pathname, action, context) {
		return this.addRoute('head', pathname, action, context)
	}

	match(methods, pathname, action, context) {
		return this.addRoute(methods, pathname, action, context)
	}

	resource(name, controller, options = { }, callback = null) {
		if(typeof controller === 'function') {
			controller = new controller(this.app)
		}

		return (new this.resourceRouteBuilderClass(this)).buildRoutes(name, controller, options, callback)
	}

	addRoute(methods, pathname, action, context) {
		if(typeof methods === 'string') {
			methods = [ methods ]
		}

		methods = methods.map(method => method.toLowerCase().trim())

		const handler = this._makeAction(action)
		const before = [ ]
		const after = [ ...this._scopedAction.after ]

		if(typeof action === 'object') {
			if(!action.use.isNil) {
				Log.error('WARNING: The `use` option in route actions has been deprecated and will be removed in 0.7')
				Log.error('--> Please use `before` and `after` insead.')

				if(Array.isArray(action.use) || typeof action.use !== 'object') {
					action.use = { before: action.use }
				}

				before.push(...makeArray(action.use.before))
				after.unshift(...makeArray(action.use.after))
			}

			before.push(...makeArray(action.before))
			after.unshift(...makeArray(action.after))
		}

		pathname = this._normalizePathComponent(pathname)
		const fullPath = path.join('/', this._scopedPrefix, pathname)
		const compiledPath = fullPath.replace(/:([a-z0-0_\-.]+)/g, (param, name) => {
			const pattern = this.patterns[name]

			if(pattern.isNil) {
				return param
			} else {
				return `${param}(${pattern})`
			}
		})

		const route = this.router.route(compiledPath)
		route.context = context || { }
		route.grindRouter = this

		let layer = this.router.stack[this.router.stack.length - 1]

		if(this._scopedAction.before.length > 0) {
			layer = new RouteLayer(route, layer, this.resolveHandlers(this._scopedAction.before), {
				sensitive: this.router.caseSensitive,
				strict: this.router.strict,
				end: true
			})

			this.router.stack[this.router.stack.length - 1] = layer
		}

		for(const method of methods) {
			const handlers = [ handler ]

			if(method !== 'get' && method !== 'head') {
				handlers.unshift(...this.bodyParserMiddleware)
			}

			route[method](...this.resolveHandlers(handlers))
		}

		if(before.length > 0) {
			route.before(...this.resolveHandlers(before))
		}

		if(after.length > 0) {
			route.after(...this.resolveHandlers(after))
		}

		if(typeof action.as === 'string') {
			route.as(action.as)
		}

		return route
	}

	_makeAction(action) {
		if(typeof action === 'function') {
			return action
		}

		if(typeof action === 'string') {
			action = { method: action }
		}

		action = Object.assign({ }, this._scopedAction, action)
		const method = action.controller[action.method]
		const controller = action.controller

		return (...args) => {
			const result = method.apply(controller, args)

			if(typeof result === 'object' && typeof result.catch === 'function') {
				return result.catch(args[2])
			}

			return result
		}
	}

	_normalizePathComponent(component) {
		component = path.normalize(component.trim()).replace(/^\//, '')

		if(component.length === 0) {
			return '/'
		}

		return component
	}

	bind(name, resolver, context) {
		this.bindings[name] = { resolver }

		if(!context.isNil) {
			this.bindings[name].context = context
		}

		this.router.param(name, (req, res, next, value) => {
			const resolve = newValue => {
				req.params[name] = newValue
				next()
			}

			const reject = next
			const result = resolver(value, resolve, reject, req, res)

			if(result.isNil || typeof result.then !== 'function') {
				return
			}

			result.then(resolve).catch(reject)
		})
	}

	pattern(name, pattern) {
		this.patterns[name] = pattern
	}

	nameRoute(name, route) {
		route.routeName = name
		this.namedRoutes[name] = route
	}

	registerMiddleware(name, middleware) {
		this.middleware[name] = middleware
	}

	resolveHandlers(handlers) {
		handlers = [ ...handlers ]

		for(const i in handlers) {
			handlers[i] = this.resolveMiddleware(handlers[i])
		}

		return handlers
	}

	resolveMiddleware(middleware) {
		if(typeof middleware === 'function') {
			return middleware
		}

		if(this.middleware[middleware].isNil) {
			throw new Error(`Unknown middleware alias: ${middleware}`)
		}

		return this.middleware[middleware]
	}

	trustProxy(...args) {
		this.app.express.set('trust proxy', ...args)
	}

}

function makeArray(value) {
	if(value.isNil) {
		return [ ]
	}

	if(Array.isArray(value)) {
		return value
	}

	return [ value ]
}
