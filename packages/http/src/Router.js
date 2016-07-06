export class Router {
	_scopedAction = null
	_scopedPrefix = ''

	app = null
	bindings = { }
	patterns = { }

	constructor(app) {
		this.app = app
	}

	group(action, callback) {
		this._scopedAction = Object.assign({ }, action)

		if(this._scopedAction.prefix) {
			this._scopedPrefix = this._scopedAction.prefix
			delete this._scopedAction.prefix
		} else {
			this._scopedPrefix = ''
		}

		callback()

		this._scopedAction = null
		this._scopedPrefix = ''
	}

	all(path, action) {
		console.log('Don’t use `all` routes. Offender: %s', path)
		return this.app.all(this._scopedPrefix + path, this._makeAction(action))
	}

	get(path, action, extra) {
		return this._add('get', path, action, extra)
	}

	post(path, action, extra) {
		return this._add('post', path, action, extra)
	}

	put(path, action, extra) {
		return this._add('put', path, action, extra)
	}

	patch(path, action, extra) {
		return this._add('patch', path, action, extra)
	}

	delete(path, action, extra) {
		return this._add('delete', path, action, extra)
	}

	_add(method, path, action, extra) {
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

		const compiledPath = (this._scopedPrefix + path).replace(/:([a-z0-0_\-\.]+)/g, (param, name) => {
			const pattern = this.patterns[name]

			if(typeof pattern === 'undefined') {
				return param
			} else {
				return param + '(' + pattern + ')'
			}
		})

		let route = this.app._router.route(compiledPath)
		route = route[method](...handlers)
		route.extra = extra || {}

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
			const result = method.apply(controller, ...args)

			if(result && typeof result === 'object' && typeof result.catch === 'function') {
				return result.catch(args[2])
			} else {
				return result
			}
		}
	}

	bind(name, resolver, extra) {
		this.bindings[name] = { resolver }

		if(extra) {
			this.bindings[name].extra = extra
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

}
