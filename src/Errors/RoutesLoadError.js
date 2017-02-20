export class RoutesLoadError extends Error {
	cause = null

	constructor(err, message) {
		if(typeof err === 'string') {
			err = null
			message = err
		}

		super(message)

		this.name = this.constructor.name
		this.cause = err
	}

}
