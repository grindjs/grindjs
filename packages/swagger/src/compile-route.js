import {route as inferRoute} from './inference/route'
import {parameter as inferParameter} from './inference/parameter'
import {expandParameters} from './expand-parameters'
import {Swagger} from './swagger'

export function compileRoute(route, app) {
	const docs = !route.extra.isNil ? route.extra.swagger : null
	var routePath = route.path
	var method = route.methods

	if(typeof method === 'object') {
		method = Object.keys(method)[0]
	} else {
		method = null
	}

	if(docs.isNil || routePath.isNil || method.isNil) {
		return null
	}

	method = method.toLowerCase()

	// Expand base parameters
	docs.parameters = expandParameters(docs.parameters)

	// Add in shared parameters
	Swagger.applyParameters(docs.use, docs.parameters)

	// Infer route, which will modify parameters
	routePath = inferRoute(routePath, app, docs.parameters)

	// Infer all parameters
	for(const parameter of docs.parameters) {
		inferParameter(parameter, method)
	}

	if(docs.parameters.length === 0) {
		delete docs.parameters
	}

	if(!docs.use.isNil) {
		delete docs.use
	}

	return { routePath, method, swagger: docs }
}
