export class HttpError extends Error {

	static representsCode = 0
	code = 0

	constructor(message) {
		super(message)

		this.name = this.constructor.name
		this.message = message || this.constructor.defaultMessage()

		this.code = this.constructor.representsCode
		this.status = this.code
		this.statusCode = this.code
	}

	static defaultMessage() {
		return this.name.replace(/Error$/, '').replace(/([A-Z])/g, ' $1').trim()
	}

}
