import './Config'
import './Controller'
import './ErrorHandler'
import './Grind'
import './HttpServer'
import './Log'
import './Paths'
import './UrlGenerator'

import './Errors'
import './Errors/MissingPackageError'
import './Errors/RoutesLoadError'

import './Routing/Router'
import './Routing/ResourceRouteBuilder'

export default Grind

export {
	Config,
	Controller,
	ErrorHandler,
	Errors,
	Grind,
	HttpServer,
	MissingPackageError,
	Paths,
	ResourceRouteBuilder,
	Router,
	RoutesLoadError,
	UrlGenerator
}

if(global.Log.isNil) {
	global.Log = Log
}
