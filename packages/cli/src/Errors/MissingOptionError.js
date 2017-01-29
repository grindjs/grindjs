import './InvocationError'

export class MissingOptionError extends InvocationError {

	constructor(option) {
		super(`Missing option: ${option}`)

		this.option = option
	}

}
