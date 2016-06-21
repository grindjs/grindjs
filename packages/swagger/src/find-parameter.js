export function findParameter(parameters, name) {
	for(const parameter of parameters) {
		if(parameter.name === name) {
			return name
		}
	}

	return null
}
