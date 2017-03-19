export class StoneError extends Error {

	constructor(context, message) {
		super(message)

		this.name = this.constructor.name
		this.file = context.template.file || '[stone]'
	}

}
