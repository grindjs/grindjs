import {route as inferRoute} from './inference/route'
import {parameter as inferParameter} from './inference/parameter'
import {expandParameters} from './expand-parameters'

export function compileRoute(route, app) {
	const swagger = !route.extra.isNil ? route.extra.swagger : null
	var routePath = route.path
	var method = route.methods

	if(typeof method === 'object') {
		method = Object.keys(method)[0]
	} else {
		method = null
	}

	if(swagger.isNil || routePath.isNil || method.isNil) {
		return null
	}

	method = method.toLowerCase()

	// Expand base parameters
	swagger.parameters = expandParameters(swagger.parameters)

	// Infer route, which will modify parameters
	routePath = inferRoute(routePath, app, swagger.parameters)

	// Infer all parameters
	for(const parameter of swagger.parameters) {
		inferParameter(parameter, method)
	}

	if(swagger.parameters.length === 0) {
		delete swagger.parameters
	}

	return { routePath, method, swagger }
}
