import {expandParameters} from './expand-parameters'
import {findParameter} from './find-parameter'

export class Swagger {
	static shared = {
		parameters: { },
		groups: { },
		learned: { }
	}

	static expandSingleParameter(name, docs) {
		if(typeof docs === 'string') {
			docs = { [name]: docs }
		}

		docs = expandParameters([ docs ])[0]

		if(docs.name.isNil) {
			docs.name = name
		}

		return docs
	}

	static parameter(name, docs) {
		Swagger.shared.parameters[name] = Swagger.expandSingleParameter(name, docs)
	}

	static parameters(name, docs) {
		Swagger.shared.groups[name] = expandParameters(docs)
	}

	static learn(name, docs) {
		Swagger.shared.learned[name] = Swagger.expandSingleParameter(name, docs)
	}

	static infer(name, docs) {
		const learned = Swagger.shared.learned[name]

		if(!learned.isNil) {
			Object.assign(docs, Object.assign({ }, learned, docs))
		}

		if(docs.type.isNil) {
			if(docs.name.startsWith('has_') || docs.name.startsWith('is_')) {
				docs.type = 'boolean'
			} else if(docs.name.endsWith('_id') || docs.name === 'id') {
				docs.type = 'integer'
			} else {
				docs.type = 'string'
			}
		}
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
