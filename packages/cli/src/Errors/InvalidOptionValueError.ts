import { InvocationError } from './InvocationError'

export class InvalidOptionValueError extends InvocationError {
	constructor(public value: string) {
		super(`Invalid option value: ${value}`)
	}
}
