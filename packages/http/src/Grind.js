import './Router'
import './Config'
import './Errors'
import './Log'
import './HttpServer'
import './RouteExtension'

import Grind from 'express'

module.exports = function(parameters = { }) {
	RouteExtension()

	const routerClass = parameters.routerClass || Router
	const configClass = parameters.configClass || Config

	const grind = Grind()

	grind.env = () => process.env.NODE_ENV || 'local'
	grind.routes = new routerClass(grind)
	grind.config = new configClass(grind)
	grind.booted = false
	grind.providers = [ ]

	grind.boot = function() {
		if(this.booted) { return }

		for(const provider of this.providers) {
			provider(this)
		}

		this.booted = true
	}

	const listen = grind.listen

	grind.listen = function(...args) {
		this.boot()
		return listen.apply(grind, args)
	}

	return grind
}

module.exports.Config = Config
module.exports.Router = Router
module.exports.Errors = Errors
module.exports.HttpServer = HttpServer

global.Log = Log
