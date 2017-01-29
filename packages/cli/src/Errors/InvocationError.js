export class InvocationError extends Error {

	constructor(message) {
		super(message)

		this.name = this.constructor.name
	}

}
