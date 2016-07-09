import $path from 'path'

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
			this._scopedPrefix = this._normalizePathComponent(this._scopedAction.prefix)
			delete this._scopedAction.prefix
		} else {
			this._scopedPrefix = ''
		}

		callback(this, action.controller)

		this._scopedAction = null
		this._scopedPrefix = ''
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

}
