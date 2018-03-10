import { HttpError } from 'grind-framework'

export class Controller {

	app = null

	constructor(app) {
		this.app = app
	}

	abort(code, message, next) {
		const error = HttpError.make(code, message)

		if(next.isNil) {
			throw error
		}

		next(error)
	}

}
