import { lazy } from 'grind-support'

import './Config'
import './Errors'
import './Errors/MissingPackageError'
import './Grind'
import './Log'
import './Paths'

export {
	Config,
	Errors,
	MissingPackageError,
	Grind,
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

export default Grind

if(global.Log.isNil) {
	global.Log = Log
}
