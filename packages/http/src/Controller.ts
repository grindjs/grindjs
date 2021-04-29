import { Application, HttpError } from '@grindjs/framework'

export class Controller {
	constructor(public app: Application) {}

	abort(code: number, message?: string, next?: (error?: Error) => void) {
		const error = HttpError.make(code, message)

		if (!next) {
			throw error
		}

		next(error)
	}
}
