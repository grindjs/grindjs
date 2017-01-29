import './InvocationError'

export class MissingArgumentError extends InvocationError {

	constructor(argument) {
		super(`Missing argument: ${argument}`)

		this.argument = argument
	}

}
