import './InvocationError'

export class InvalidOptionValueError extends InvocationError {

	constructor(value) {
		super(`Invalid option value: ${value}`)

		this.value = value
	}

}
