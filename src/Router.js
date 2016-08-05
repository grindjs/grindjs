import $path from 'path'

export class Router {
	app = null
	bindings = { }
	patterns = { }
	namedRoutes = { }

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
	}

	group(action, callback) {
		const parentAction = this._scopedAction
		const parentPrefix = this._scopedPrefix

		const scopedAction = Object.assign({ }, parentAction, action)
		let scopedPrefix = scopedAction.prefix
		delete scopedAction.prefix
		this._scopedActionStack.push(scopedAction)

		if(!scopedPrefix.isNil && scopedPrefix.length > 0) {
			if(!parentPrefix.isNil && parentPrefix.length > 0) {
				scopedPrefix = $path.join(parentPrefix, scopedPrefix)
			}

			this._scopedPrefixStack.push(this._normalizePathComponent(scopedPrefix))
		} else {
			this._scopedPrefixStack.push(parentPrefix)
		}

		callback(this, action.controller)

		this._scopedActionStack.pop()
		this._scopedPrefixStack.pop()
	}

	all(path, action) {
		console.log('Don’t use `all` routes. Offender: %s', path)
		return this.app.all(this._scopedPrefix + path, this._makeAction(action))
	}

	get(path, action, context) {
		return this._add('get', path, action, context)
	}

	post(path, action, context) {
		return this._add('post', path, action, context)
	}

	put(path, action, context) {
		return this._add('put', path, action, context)
	}

	patch(path, action, context) {
		return this._add('patch', path, action, context)
	}

	delete(path, action, context) {
		return this._add('delete', path, action, context)
	}

	_add(method, path, action, context) {
		const handler = this._makeAction(action)

		// WARNING: Prone to failure if ExpressJS changes this logic
		this.app.lazyrouter()

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

		path = this._normalizePathComponent(path)
		const compiledPath = $path.join('/', this._scopedPrefix, path).replace(/:([a-z0-0_\-\.]+)/g, (param, name) => {
			const pattern = this.patterns[name]

			if(pattern.isNil) {
				return param
			} else {
				return param + '(' + pattern + ')'
			}
		})

		let route = this.app._router.route(compiledPath)
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
		return $path.normalize(component.trim()).replace(/^\//, '')
	}

	bind(name, resolver, context) {
		this.bindings[name] = { resolver }

		if(!context.isNil) {
			this.bindings[name].context = context
		}

		this.app.param(name, (req, res, next, value) => {
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
