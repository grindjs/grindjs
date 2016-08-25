export function expandParameters(parameters) {
	parameters = parameters || [ ]

	for(const k in parameters) {
		if(typeof parameters[k] !== 'string') {
			continue
		}

		parameters[k] = {
			description: parameters[k]
		}
	}

	if(typeof parameters === 'object' && !Array.isArray(parameters)) {
		parameters = Object.keys(parameters).map(key => {
			const parameter = Object.assign({ }, parameters[key])

			if(parameter.name.isNil) {
				parameter.name = key
			}

			return parameter
		})
	} else {
		parameters = parameters.map(parameter => Object.assign({ }, parameter))
	}

	return parameters
}
