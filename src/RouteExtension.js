import {Route} from 'express'

let hasExtended = false

export function RouteExtension() {
	if(hasExtended) {
		return
	}

	hasExtended = true

	Route.prototype.use = function(method, handle, prepend = true) {
		if(typeof method === 'function') {
			handle = method
			method = null
		}

		if(typeof handle !== 'function') {
			throw new TypeError('Route.use() requires callback functions but got a ' + (typeof handle))
		}

		if(!method) {
			method = Object.keys(this.methods)[0]
		}

		if(typeof this.methods[method] === 'undefined' || this.stack.length === 0) {
			throw new Error('Route.use() requires method to be already registered, ' + method + ' is not yet registered.')
		}

		const LayerClass = this.stack[0].constructor

		const layer = LayerClass('/', { }, handle)
		layer.method = method

		if(prepend) {
			this.stack.unshift(layer)
		} else {
			this.stack.push(layer)
		}

		return this
	}

	Route.prototype.useBefore = function(method, handle) {
		return this.use(method, handle, true)
	}

	Route.prototype.useAfter = function(method, handle) {
		return this.use(method, handle, false)
	}

	Route.prototype.as = function(name) {
		this.grindRouter.nameRoute(name, this)
	}

}
