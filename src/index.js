import { lazy } from 'grind-support'

import './Application'
import './Config'
import './Errors'
import './Errors/MissingPackageError'
import './Log'
import './Paths'

export {
	Application,
	Config,
	Errors,
	MissingPackageError,
	Paths
}

lazy(module.exports, 'Controller', () => require('./Controller.js').Controller)
lazy(module.exports, 'ErrorHandler', () => require('./ErrorHandler.js').ErrorHandler)
lazy(module.exports, 'HttpServer', () => require('./HttpServer.js').HttpServer)
lazy(module.exports, 'ResourceRouteBuilder', () => require('./Routing/ResourceRouteBuilder.js').ResourceRouteBuilder)
lazy(module.exports, 'Router', () => require('./Routing/Router.js').Router)
lazy(module.exports, 'Router', () => require('./Routing/Router.js').Router)
lazy(module.exports, 'RoutesLoadError', () => require('./Errors/RoutesLoadError.js').RoutesLoadError)
lazy(module.exports, 'UrlGenerator', () => require('./UrlGenerator.js').UrlGenerator)

export default Application

// Prior to 0.8, Application was Grind
// Exporting Grind alias for legacy purposes
export const Grind = Application

if(global.Log.isNil) {
	global.Log = Log
}
