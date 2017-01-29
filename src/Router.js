import bodyParser from 'body-parser'
import path from 'path'
import express from 'express'

export class Router {
	app = null
	bindings = { }
	patterns = { }
	namedRoutes = { }
	middleware = { }
	bodyParserMiddleware = [ ]

	_scopedActionStack = [ { } ]
	_scopedPrefixStack = [ '/' ]

	get _scopedAction() {
		return this._scopedActionStack[this._scopedActionStack.length - 1]
	}

	get _scopedPrefix() {
		return this._scopedPrefixStack[this._scopedPrefixStack.length - 1]
	}

	constructor(app) {
		this.app = app

		const parsers = app.config.get('app.body_parsers', [ 'json', 'form' ])

		if(!Array.isArray(parsers)) {
			this.bodyParserMiddleware = parsers.isNil ? [ ] : [ parsers ]
		} else {
			this.bodyParserMiddleware = parsers
		}

		this.middleware.json = bodyParser.json()
		this.middleware.form = bodyParser.urlencoded({ extended: true })
	}

	group(action, callback) {
		if(!action.controller.isNil && typeof action.controller === 'function') {
			action.controller = new action.controller(this.app)
		}

		const parentAction = this._scopedAction
		const parentPrefix = this._scopedPrefix

		const scopedAction = Object.assign({ }, parentAction, action)
		let scopedPrefix = scopedAction.prefix
		delete scopedAction.prefix
		this._scopedActionStack.push(scopedAction)

		if(!scopedPrefix.isNil && scopedPrefix.length > 0) {
			if(!parentPrefix.isNil && parentPrefix.length > 0) {
				scopedPrefix = path.join(parentPrefix, scopedPrefix)
			}

			this._scopedPrefixStack.push(this._normalizePathComponent(scopedPrefix))
		} else {
			this._scopedPrefixStack.push(parentPrefix)
		}

		callback(this, action.controller)

		this._scopedActionStack.pop()
		this._scopedPrefixStack.pop()
	}

	all(pathname, action) {
		console.log('Don’t use `all` routes. Offender: %s', pathname)
		return this.app.express.all(this._scopedPrefix + pathname, this._makeAction(action))
	}

	use(path, ...middlewares) {
		if(typeof path === 'function' || !this.middleware[path].isNil) {
			middlewares.unshift(path)
			path = null
		}

		for(const middleware of middlewares) {
			if(path.isNil) {
				this.app.express.use(this.resolveMiddleware(middleware))
			} else {
				this.app.express.use(path, this.resolveMiddleware(middleware))
			}
		}
	}

	static(pathname, filePath, options) {
		pathname = this._normalizePathComponent(pathname)
		pathname = path.join('/', this._scopedPrefix, pathname)

		if(filePath.substring(0, 1) !== '/') {
			filePath = this.app.paths.public(filePath)
		}

		this.use(pathname, express.static(filePath, options))
	}

	get(pathname, action, context) {
		return this._add('get', pathname, action, context)
	}

	post(pathname, action, context) {
		return this._add('post', pathname, action, context)
	}

	put(pathname, action, context) {
		return this._add('put', pathname, action, context)
	}

	patch(pathname, action, context) {
		return this._add('patch', pathname, action, context)
	}

	delete(pathname, action, context) {
		return this._add('delete', pathname, action, context)
	}

	options(pathname, action, context) {
		return this._add('options', pathname, action, context)
	}

	head(pathname, action, context) {
		return this._add('head', pathname, action, context)
	}

	_add(method, pathname, action, context) {
		const handler = this._makeAction(action)

		// WARNING: Prone to failure if ExpressJS changes this logic
		this.app.express.lazyrouter()

		const handlers = [ handler ]
		this.addMiddleware(handlers, this._scopedAction.use)

		if(typeof action === 'object') {
			this.addMiddleware(handlers, action.use)
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

		if(method.toLowerCase() !== 'get' && this.bodyParserMiddleware.length > 0) {
			handlers.unshift(...this.bodyParserMiddleware)
		}

		for(const i in handlers) {
			handlers[i] = this.resolveMiddleware(handlers[i])
		}

		let route = this.app.express._router.route(compiledPath)
		route = route[method](...handlers)
		route.context = context || {}
		route.grindRouter = this

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
			} else {
				return result
			}
		}
	}

	_normalizePathComponent(component) {
		return path.normalize(component.trim()).replace(/^\//, '')
	}

	bind(name, resolver, context) {
		this.bindings[name] = { resolver }

		if(!context.isNil) {
			this.bindings[name].context = context
		}

		this.app.express.param(name, (req, res, next, value) => {
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

	resolveMiddleware(middleware) {
		if(typeof middleware === 'function') {
			return middleware
		}

		if(this.middleware[middleware].isNil) {
			throw new Error(`Unknown middleware alias: ${middleware}`)
		}

		return this.middleware[middleware]
	}

	addMiddleware(handlers, middleware) {
		if(middleware.isNil) {
			return
		}

		if(typeof middleware === 'string') {
			middleware = { before: [ middleware ] }
		}

		if(Array.isArray(middleware)) {
			middleware = { before: middleware }
		}

		if(Array.isArray(middleware.before)) {
			handlers.unshift(...middleware.before)
		} else if(Array.isArray(middleware.before)) {
			handlers.push(...middleware.after)
		}
	}

	trustProxy(...args) {
		this.app.express.set('trust proxy', ...args)
	}

}
