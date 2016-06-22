import {Swagger} from '../swagger'

export function parameter(parameter, method) {
	if(parameter.required.isNil) {
		parameter.required = method !== 'get'
	}

	if(parameter.in.isNil) {
		parameter.in = method === 'get' ? 'query' : 'body'
	}

	Swagger.infer(parameter.name, parameter)
}
