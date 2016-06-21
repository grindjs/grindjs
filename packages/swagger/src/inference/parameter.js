export function parameter(parameter, method) {
	if(parameter.required.isNil) {
		parameter.required = method !== 'get'
	}

	if(parameter.in.isNil) {
		parameter.in = method === 'get' ? 'query' : 'body'
	}

	if(parameter.type.isNil) {
		if(parameter.name.endsWith('_id') || parameter.name === 'id') {
			parameter.type = 'integer'
		} else {
			parameter.type = 'string'
		}
	}
}
