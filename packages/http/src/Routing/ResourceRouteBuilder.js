import { Inflect } from 'grind-support'

//
// Adapted from Laravel:
// https://github.com/laravel/framework/blob/b75aca6a203590068161835945213fd1a39c7080/src/Illuminate/Routing/ResourceRegistrar.php
//

export class ResourceRouteBuilder {

	routes = null
	resourceDefaults = [ 'index', 'create', 'store', 'show', 'edit', 'update', 'destroy' ]
	parameters = null

	static parameterMap = [ ]
	static singularParameters = true
	static verbs = {
		create: 'create',
		edit: 'edit',
	}

	constructor(routes) {
		this.routes = routes
	}

	buildRoutes(name, controller, options = { }, callback = null) {
		if(typeof options === 'function') {
			callback = options
			options = { }
		}

		if(!options.parameters.isNil && !this.parameters.isNil) {
			this.parameters = options.parameters
		}

		// If the resource name contains a slash, we will assume the developer wishes to
		// register these resource routes with a prefix so we will set that up out of
		// the box so they don't have to mess with it. Otherwise, we will continue.
		if(name.indexOf('/') >= 0) {
			return this._prefixedResource(name, controller, options, callback)
		}

		// We need to extract the base resource from the resource name. Nested resources
		// are supported in the framework, but we need to know what name to use for a
		// placeholder on the route parameters, which should be the base resources.
		const segments = name.split(/\./)
		const base = this.getResourceWildcard(segments[segments.length - 1])

		return this.routes.group({
			controller,
			prefix: this.getResourceUri(name),
			before: options.before,
			after: options.after
		}, routes => {
			if(typeof callback === 'function') {
				callback(routes, controller)
			}

			for(const m of this._getResourceMethods(this.resourceDefaults, options)) {
				const method = `_addResource${m.substring(0, 1).toUpperCase()}${m.substring(1)}`
				this[method](name, base, controller, options)
			}
		})
	}

	_prefixedResource(name, controller, options = { }, callback = null) {
		const { name: segment, prefix } = this._getResourcePrefix(name)

		// We need to extract the base resource from the resource name. Nested resources
		// are supported in the framework, but we need to know what name to use for a
		// placeholder on the route parameters, which should be the base resources.
		return this.routes.group({ prefix }, () => {
			this.buildRoutes(segment, controller, options, callback)
		})
	}

	_getResourcePrefix(name) {
		const segments = name.split(/\//)

		// To get the prefix, we will take all of the name segments and implode them on
		// a slash. This will generate a proper URI prefix fors us. Then we take this
		// last segment, which will be considered the final resources name we use.
		const prefix = segments.slice(0, -1).join('/')

		return {
			name: segments[segments.length - 1],
			prefix
		}
	}

	_getResourceMethods(defaults, options) {
		if(!options.only.isNil) {
			return defaults.filter(method => options.only.indexOf(method) >= 0)
		} else if(!options.except.isNil) {
			return defaults.filter(method => options.except.indexOf(method) === -1)
		}

		return defaults
	}

	_addResourceIndex(name, base, controller, options) {
		const action = this._getResourceAction(name, controller, 'index', options)

		if(typeof controller[action.method] !== 'function') {
			return null
		}

		return this.routes.get('', action)
	}

	_addResourceCreate(name, base, controller, options) {
		const action = this._getResourceAction(name, controller, 'create', options)

		if(typeof controller[action.method] !== 'function') {
			return null
		}

		return this.routes.get(this.constructor.verbs.create, action)
	}

	_addResourceStore(name, base, controller, options) {
		const action = this._getResourceAction(name, controller, 'store', options)

		if(typeof controller[action.method] !== 'function') {
			return null
		}

		return this.routes.post('', action)
	}

	_addResourceShow(name, base, controller, options) {
		const action = this._getResourceAction(name, controller, 'show', options)

		if(typeof controller[action.method] !== 'function') {
			return null
		}

		return this.routes.get(`:${base}`, action)
	}

	_addResourceEdit(name, base, controller, options) {
		const action = this._getResourceAction(name, controller, 'edit', options)

		if(typeof controller[action.method] !== 'function') {
			return null
		}

		return this.routes.get(`:${base}/${this.constructor.verbs.edit}`, action)
	}

	_addResourceUpdate(name, base, controller, options) {
		const action = this._getResourceAction(name, controller, 'update', options)

		if(typeof controller[action.method] !== 'function') {
			return null
		}

		return this.routes.match([ 'put', 'patch' ], `:${base}`, action)
	}

	_addResourceDestroy(name, base, controller, options) {
		const action = this._getResourceAction(name, controller, 'destroy', options)

		if(typeof controller[action.method] !== 'function') {
			return null
		}

		return this.routes.delete(`:${base}`, action)
	}

	getResourceUri(resource) {
		if(resource.indexOf('.') === -1) {
			return resource
		}

		// Once we have built the base URI, we'll remove the parameter holder for this
		// base resource name so that the individual route adders can suffix these
		// paths however they need to, as some do not have any parameters at all.
		const segments = resource.split(/\./)
		const uri = this._getNestedResourceUri(segments)

		return uri.replace(`/:${this.getResourceWildcard(segments[segments.length - 1])}`, '')
	}

	_getNestedResourceUri(segments) {
		// We will spin through the segments and create a placeholder for each of the
		// resource segments, as well as the resource itself. Then we should get an
		// entire string for the resource URI that contains all nested resources.
		return segments.map(s => `${s}/:${this.getResourceWildcard(s)}`).join('/')
	}

	getResourceWildcard(value) {
		if(!this.parameters.isNil && !this.parameters.isNil[value]) {
			value = this.parameters[value]
		} else if(!this.constructor.parameterMap.isNil && !this.constructor.parameterMap[value].isNil) {
			value = this.constructor.parameterMap[value]
		} else if(this.parameters === 'singular' || this.constructor.singularParameters) {
			value = Inflect.singularize(value)
		}

		return value.replace(/-/g, '_')
	}

	_getResourceAction(resource, controller, method, options) {
		return {
			as: this._getResourceRouteName(resource, method, options),
			method: method
		}
	}

	_getResourceRouteName(resource, method, options) {
		let name = resource

		// If the names array has been provided to us we will check for an entry in the
		// array first. We will also check for the specific method within this array
		// so the names may be specified on a more "granular" level using methods.
		if(!options.names.isNil) {
			if(typeof options.names === 'string') {
				name = options.names
			} else if(!options.names[method].isNil) {
				return options.names[method]
			}
		}

		// If a global prefix has been assigned to all names for this resource, we will
		// grab that so we can prepend it onto the name when we create this name for
		// the resource action. Otherwise we'll just use an empty string for here.
		const prefix = !options.as.isNil ? `${options.as}.` : ''
		return `${prefix}${name}.${method}`.replace(/(^\.|\.$)/g, '')
	}

	static singularParameters(singular = true) {
		this.singularParameters = singular
	}

	static getParameters() {
		return [ ...this.parameterMap ]
	}

	static setParameters(parameters = [ ]) {
		this.parameterMap = [ ...parameters ]
	}

	static verbs(verbs = { }) {
		if(Object.keys(verbs).length === 0) {
			return { ...this.verbs }
		}

		this.verbs = { ...this.verbs, ...verbs }
	}

}
