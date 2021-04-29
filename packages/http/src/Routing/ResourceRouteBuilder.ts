import { Inflect } from '@grindjs/support'

import { Router, RouterGroupCallback, RouterMiddlwareCollection } from './Router'

//
// Adapted from Laravel:
// https://github.com/laravel/framework/blob/b75aca6a203590068161835945213fd1a39c7080/src/Illuminate/Routing/ResourceRegistrar.php
//

const methods = ['index', 'create', 'store', 'show', 'edit', 'update', 'destroy'] as const
export type ResourceMethod = typeof methods[number]

export type ResourceOptions = Partial<{
	names: string | Record<string, string>
	as: string
	parameters: Record<string, string> | 'singular'
	before: RouterMiddlwareCollection
	after: RouterMiddlwareCollection
	only?: ResourceMethod[]
	except?: ResourceMethod[]
}>

export class ResourceRouteBuilder {
	['constructor']: typeof ResourceRouteBuilder
	resourceDefaults: ResourceMethod[] = [...methods]
	parameters: Record<string, string> | 'singular' | null = null

	static parameterMap: Record<string, string> = {}
	static singularParameters = true
	static verbs: Record<string, string> = {
		create: 'create',
		edit: 'edit',
	}

	constructor(public routes: Router) {}

	buildRoutes(
		name: string,
		controller: any,
		options: ResourceOptions | RouterGroupCallback = {},
		callback: RouterGroupCallback | null = null,
	) {
		if (typeof options === 'function') {
			callback = options
			options = {}
		}

		if (options.parameters && this.parameters) {
			this.parameters = options.parameters
		}

		// If the resource name contains a slash, we will assume the developer wishes to
		// register these resource routes with a prefix so we will set that up out of
		// the box so they don't have to mess with it. Otherwise, we will continue.
		if (name.indexOf('/') >= 0) {
			return this._prefixedResource(name, controller, options, callback)
		}

		// We need to extract the base resource from the resource name. Nested resources
		// are supported in the framework, but we need to know what name to use for a
		// placeholder on the route parameters, which should be the base resources.
		const segments = name.split(/\./)
		const base = this.getResourceWildcard(segments[segments.length - 1])

		return this.routes.group(
			{
				controller,
				prefix: this.getResourceUri(name),
				before: options.before,
				after: options.after,
			},
			routes => {
				if (typeof callback === 'function') {
					callback(routes, controller)
				}

				for (const m of this._getResourceMethods(
					this.resourceDefaults,
					options as ResourceOptions,
				)) {
					const method = `_addResource${m.substring(0, 1).toUpperCase()}${m.substring(1)}`
					;(this as any)[method](name, base, controller, options)
				}
			},
		)
	}

	_prefixedResource(
		name: string,
		controller: any,
		options: ResourceOptions = {},
		callback: RouterGroupCallback | null = null,
	) {
		const { name: segment, prefix } = this._getResourcePrefix(name)

		// We need to extract the base resource from the resource name. Nested resources
		// are supported in the framework, but we need to know what name to use for a
		// placeholder on the route parameters, which should be the base resources.
		return this.routes.group({ prefix }, () => {
			this.buildRoutes(segment, controller, options, callback)
		})
	}

	_getResourcePrefix(name: string) {
		const segments = name.split(/\//)

		// To get the prefix, we will take all of the name segments and implode them on
		// a slash. This will generate a proper URI prefix fors us. Then we take this
		// last segment, which will be considered the final resources name we use.
		const prefix = segments.slice(0, -1).join('/')

		return {
			name: segments[segments.length - 1],
			prefix,
		}
	}

	_getResourceMethods(defaults: ResourceMethod[], options: ResourceOptions) {
		if (options.only) {
			return defaults.filter(method => options.only!.indexOf(method) >= 0)
		} else if (options.except) {
			return defaults.filter(method => options.except!.indexOf(method) === -1)
		}

		return defaults
	}

	_addResourceIndex(name: string, base: string, controller: any, options: ResourceOptions) {
		const action = this._getResourceAction(name, controller, 'index', options)

		if (typeof controller[action.method] !== 'function') {
			return null
		}

		return this.routes.get('', action)
	}

	_addResourceCreate(name: string, base: string, controller: any, options: ResourceOptions) {
		const action = this._getResourceAction(name, controller, 'create', options)

		if (typeof controller[action.method] !== 'function') {
			return null
		}

		return this.routes.get(this.constructor.verbs.create, action)
	}

	_addResourceStore(name: string, base: string, controller: any, options: ResourceOptions) {
		const action = this._getResourceAction(name, controller, 'store', options)

		if (typeof controller[action.method] !== 'function') {
			return null
		}

		return this.routes.post('', action)
	}

	_addResourceShow(name: string, base: string, controller: any, options: ResourceOptions) {
		const action = this._getResourceAction(name, controller, 'show', options)

		if (typeof controller[action.method] !== 'function') {
			return null
		}

		return this.routes.get(`:${base}`, action)
	}

	_addResourceEdit(name: string, base: string, controller: any, options: ResourceOptions) {
		const action = this._getResourceAction(name, controller, 'edit', options)

		if (typeof controller[action.method] !== 'function') {
			return null
		}

		return this.routes.get(`:${base}/${this.constructor.verbs.edit}`, action)
	}

	_addResourceUpdate(name: string, base: string, controller: any, options: ResourceOptions) {
		const action = this._getResourceAction(name, controller, 'update', options)

		if (typeof controller[action.method] !== 'function') {
			return null
		}

		return this.routes.match(['put', 'patch'], `:${base}`, action)
	}

	_addResourceDestroy(name: string, base: string, controller: any, options: ResourceOptions) {
		const action = this._getResourceAction(name, controller, 'destroy', options)

		if (typeof controller[action.method] !== 'function') {
			return null
		}

		return this.routes.delete(`:${base}`, action)
	}

	getResourceUri(resource: string) {
		if (resource.indexOf('.') === -1) {
			return resource
		}

		// Once we have built the base URI, we'll remove the parameter holder for this
		// base resource name so that the individual route adders can suffix these
		// paths however they need to, as some do not have any parameters at all.
		const segments = resource.split(/\./)
		const uri = this._getNestedResourceUri(segments)

		return uri.replace(`/:${this.getResourceWildcard(segments[segments.length - 1])}`, '')
	}

	_getNestedResourceUri(segments: string[]) {
		// We will spin through the segments and create a placeholder for each of the
		// resource segments, as well as the resource itself. Then we should get an
		// entire string for the resource URI that contains all nested resources.
		return segments.map(s => `${s}/:${this.getResourceWildcard(s)}`).join('/')
	}

	getResourceWildcard(value: string) {
		if (typeof this.parameters !== 'string' && this.parameters?.[value]) {
			value = this.parameters[value]
		} else if (this.constructor.parameterMap?.[value]) {
			value = this.constructor.parameterMap[value]
		} else if (this.parameters === 'singular' || this.constructor.singularParameters) {
			value = Inflect.singularize(value)
		}

		return value.replace(/-/g, '_')
	}

	_getResourceAction(
		resource: string,
		controller: any,
		method: string,
		options: ResourceOptions,
	) {
		return {
			as: this._getResourceRouteName(resource, method, options),
			method: method,
		}
	}

	_getResourceRouteName(resource: string, method: string, options: ResourceOptions) {
		let name = resource

		// If the names array has been provided to us we will check for an entry in the
		// array first. We will also check for the specific method within this array
		// so the names may be specified on a more "granular" level using methods.
		if (options.names) {
			if (typeof options.names === 'string') {
				name = options.names
			} else if (options.names[method]) {
				return options.names[method]
			}
		}

		// If a global prefix has been assigned to all names for this resource, we will
		// grab that so we can prepend it onto the name when we create this name for
		// the resource action. Otherwise we'll just use an empty string for here.
		const prefix = options.as ? `${options.as}.` : ''
		return `${prefix}${name}.${method}`.replace(/(^\.|\.$)/g, '')
	}

	static getParameters() {
		return { ...this.parameterMap }
	}

	static setParameters(parameters = {}) {
		this.parameterMap = { ...parameters }
	}
}
