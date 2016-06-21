import {findParameter} from '../find-parameter'

function processPathParameter(app, parameters, name, pattern, optional) {
	var parameter = findParameter(parameters, name)

	if(parameter === null) {
		const binding = app.routes.bindings[name]

		if(!binding.isNil && !binding.extra.isNil && !binding.extra.swagger.isNil) {
			parameter = Object.assign({ }, app.routes.bindings[name].extra.swagger)
			parameters.push(parameter)
		}
	}

	if(parameter !== null) {
		if(typeof pattern === 'string') {
			parameter.pattern = pattern
		}

		if(parameter.required.isNil) {
			parameter.required = optional !== '?'
		}

		if(parameter.in.isNil) {
			parameter.in = 'url'
		}
	}

	return '{' + name + '}'
}

export function route(path, app, parameters) {
	return path.replace(/:([a-z0-0_\-\.]+)(?:\(([^\)]+)\))?(\?)?/g, (...args) => {
		args.shift()
		return processPathParameter(app, parameters, ...args)
	})
}
