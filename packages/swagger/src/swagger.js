import {expandParameters} from './expand-parameters'
import {findParameter} from './find-parameter'

export class Swagger {
	static shared = {
		parameters: { },
		groups: { }
	}

	static parameter(name, docs) {
		if(typeof docs === 'string') {
			docs = { [name]: docs }
		}

		docs = expandParameters([ docs ])[0]

		if(docs.name.isNil) {
			docs.name = name
		}

		Swagger.shared.parameters[name] = docs
	}

	static parameters(name, docs) {
		Swagger.shared.groups[name] = expandParameters(docs)
	}

	static applyParameters(names, docs) {
		names = names || [ ]

		if(typeof names === 'string') {
			names = [ names ]
		}

		for(const name of names) {
			var sharedParameters = null

			// typeof undefined pending https://github.com/MaxMEllon/babel-plugin-transform-isNil/issues/3

			if(typeof Swagger.shared.groups[name] !== 'undefined') {
				sharedParameters = Swagger.shared.groups[name]
			} else if(typeof Swagger.shared.parameters[name].isNil !== 'undefined') {
				sharedParameters = [ Swagger.shared.parameters[name] ]
			}

			if(sharedParameters.isNil) {
				continue
			}

			for(const sharedParameter of sharedParameters) {
				const parameter = findParameter(docs, sharedParameter.name)

				if(parameter.isNil) {
					docs.push(Object.assign({ }, sharedParameter))
				} else {
					Object.assign(parameter, Object.assign({ }, sharedParameter, parameter))
				}
			}
		}
	}

}
