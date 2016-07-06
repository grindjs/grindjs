import {Router} from './Router'
import {Config} from './Config'
import {Errors} from './Errors'
import {RouteExtension} from './RouteExtension'

import Grind from 'express'

module.exports = function() {
	RouteExtension()

	var grind = Grind()

	grind.env = () => process.env.NODE_ENV || 'local'
	grind.routes = new Router(grind)
	grind.config = new Config(grind)
	grind.booted = false
	grind.providers = [ ]

	grind.boot = function() {
		if(this.booted) { return }

		for(const provider of this.providers) {
			provider(this)
		}

		this.booted = true
	}

	var listen = grind.listen

	grind.listen = function(...args) {
		this.boot()
		return listen.apply(grind, args)
	}

	return grind
}
