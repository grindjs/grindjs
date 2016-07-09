export class HttpError extends Error {

	static representsCode = 0
	code = 0

	constructor(message) {
		super(message)

		this.name = this.constructor.name
		this.message = message
		this.code = this.constructor.representsCode
	}

}
