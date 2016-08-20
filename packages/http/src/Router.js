import bodyParser from 'body-parser'
import path from 'path'

export class Router {
	app = null
	bindings = { }
	patterns = { }
	namedRoutes = { }
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

		let parsers = app.config.get('app.body_parsers', [ 'json', 'form' ])

		if(!Array.isArray(parsers)) {
			parsers = parsers.isNil ? [ ] : [ parsers ]
		}

		parsers = parsers.map(name => name.toString().trim().toLowerCase())

		for(const name of new Set(parsers)) {
			switch(name) {
				case 'json':
					this.bodyParserMiddleware.push(bodyParser.json())
					break
				case 'form':
					this.bodyParserMiddleware.push(bodyParser.urlencoded({ extended: true }))
					break
				default:
					Log.comment('Unsupported body parsers', name)
			}
		}
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

	_add(method, pathname, action, context) {
		const handler = this._makeAction(action)

		// WARNING: Prone to failure if ExpressJS changes this logic
		this.app.express.lazyrouter()

		const handlers = [ handler ]

		if(typeof action.use !== 'undefined') {
			if(Array.isArray(action.use)) {
				action.use = {
					before: action.use
				}
			}

			if(typeof action.use === 'object') {
				if(Array.isArray(action.use.before)) {
					handlers.unshift(...action.use.before)
				} else if(Array.isArray(action.use.before)) {
					handlers.push(...action.use.after)
				}
			}
		}

		pathname = this._normalizePathComponent(pathname)
		const compiledPath = path.join('/', this._scopedPrefix, pathname).replace(/:([a-z0-0_\-\.]+)/g, (param, name) => {
			const pattern = this.patterns[name]

			if(pattern.isNil) {
				return param
			} else {
				return param + '(' + pattern + ')'
			}
		})

		if(method.toLowerCase() !== 'get' && this.bodyParserMiddleware.length > 0) {
			handlers.unshift(...this.bodyParserMiddleware)
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
			resolver(value, newValue => {
				req.params[name] = newValue
				next()
			}, err => {
				next(err)
			}, req, res)
		})
	}

	pattern(name, pattern) {
		this.patterns[name] = pattern
	}

	nameRoute(name, route) {
		route.routeName = name
		this.namedRoutes[name] = route
	}

}
