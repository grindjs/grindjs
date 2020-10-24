import { InvocationError } from './InvocationError'

export class InvalidOptionError extends InvocationError {
	constructor(public option: string) {
		super(`Invalid option: ${option}`)
	}
}
