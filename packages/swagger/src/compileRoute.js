import './Swagger'
import './expandParameters'

import { route as inferRoute } from './Inference/route'
import { parameter as inferParameter } from './Inference/parameter'

export function compileRoute(route, app) {
	let docs = !route.context.isNil ? route.context.swagger : null
	let routePath = route.path
	let method = route.methods

	if(typeof method === 'object') {
		method = Object.keys(method)[0]
	} else {
		method = null
	}

	if(docs.isNil || routePath.isNil || method.isNil) {
		return null
	}

	method = method.toLowerCase()

	if(typeof docs === 'string') {
		docs = { description: docs }
	}

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

	if(docs.responses.isNil) {
		docs.responses = {
			default: {
				description: docs.description || ''
			}
		}
	}

	return { routePath, method, swagger: docs }
}
