export function findParameter(parameters, name) {
	for(const parameter of parameters) {
		if(parameter.name === name) {
			return parameter
		}
	}

	return null
}
