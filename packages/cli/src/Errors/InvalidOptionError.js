import './InvocationError'

export class InvalidOptionError extends InvocationError {

	constructor(option) {
		super(`Invalid option: ${option}`)

		this.option = option
	}

}
