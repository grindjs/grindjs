export class ValidationError extends Error {

	errors = { }

	constructor(joiError, data) {
		super(joiError.message)

		this.name = this.constructor.name
		this.data = data

		if(!Array.isArray(joiError.details)) {
			return
		}

		for(const error of joiError.details) {
			const key = error.path
			const e = { ...error }
			delete e.path

			this.errors[key] = this.errors[key] || [ ]
			this.errors[key].push(e)
		}
	}

}
