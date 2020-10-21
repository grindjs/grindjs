export class HttpError extends Error {
	static representsCode = 0
	message: string
	status: number
	statusCode: number
	code = 0

	constructor(message: string) {
		super(message)

		const errorClass = this.constructor as typeof HttpError
		this.name = this.constructor.name
		this.message = message || errorClass.defaultMessage()

		this.code = errorClass.representsCode
		this.status = this.code
		this.statusCode = this.code
	}

	static defaultMessage(): string {
		return this.name
			.replace(/Error$/, '')
			.replace(/([A-Z])/g, ' $1')
			.trim()
	}

	static make(code: number, message: string): HttpError {
		throw new Error('Unimplemented')
	}
}
