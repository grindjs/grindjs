import Joi from 'joi'
import './ValidationError'

export class Validator {

	app
	options
	extensions = [ ]
	_joi = null

	constructor(app, options = { }) {
		if(options.isNil) {
			options = { }
		}

		this.app = app
		this.options = {
			abortEarly: false,
			...options
		}
	}

	get joi() {
		if(this._joi === null) {
			if(Object.keys(this.extensions).length > 0) {
				this._joi = Joi.extend(...Object.values(this.extensions))
			} else {
				this._joi = Joi
			}
		}

		return this._joi
	}

	build(builder) {
		return this.joi.object().keys(builder(this.joi))
	}

	validate(data, schema, options) {
		if(options.isNil) {
			options = { }
		}

		if(typeof schema === 'function') {
			schema = this.build(schema)
		}

		options = {
			...this.options,
			...options
		}

		// Check if we’ve been passed a req object
		if(typeof data.header === 'function') {
			data = data.body
		}

		return new Promise((resolve, reject) => {
			this.joi.validate(data, schema, options, (err, value) => {
				if(!err.isNil) {
					if(err.isJoi === true) {
						err = new ValidationError(err, data)
					}

					return reject(err)
				}

				return resolve(value)
			})
		})
	}

	extend(name, type, options, validator) {
		if(!type.isNil && typeof type === 'object') {
			validator = options
			options = type
			type = null
		}

		if(typeof options === 'function') {
			validator = options
			options = { }
		} else if(typeof type === 'function') {
			validator = type
			type = null
			options = { }
		}

		if(type.isNil) {
			type = 'any'
		}

		let extension = this.extensions[type]
		this._joi = null

		if(extension.isNil) {
			extension = {
				base: Joi[type](),
				name: type,
				language: { },
				rules: [ ],
				...options
			}

			this.extensions[type] = extension
		} else {
			if(!options.language.isNil) {
				Object.assign(extension.language, options.language)
				delete extension.language
			}

			Object.assign(extension, options)
		}

		extension.rules.push({
			name: name,
			validate: function(params, value, state, options) {
				try {
					return validator(value, params, this, state, options)
				} catch(err) {
					options.language = {
						_dynamicLabel: err.message,
						...(options.language || { })
					}

					return this.createError('_dynamicLabel', { v: value }, state, options)
				}
			}
		})
	}

}
