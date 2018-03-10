export class RoutesLoadError extends Error {

	cause = null

	constructor(err, message) {
		if(typeof err === 'string') {
			message = err
			err = null
		}

		super(message)

		this.name = this.constructor.name
		this.cause = err
	}

}
