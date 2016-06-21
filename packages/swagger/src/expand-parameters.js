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
		parameters = Object.entries(parameters).map(entry => {
			const parameter = Object.assign({ }, entry[1])

			if(parameter.name.isNil) {
				parameter.name = entry[0]
			}

			return parameter
		})
	} else {
		parameters = parameters.map(parameter => Object.assign({ }, parameter))
	}

	return parameters
}
