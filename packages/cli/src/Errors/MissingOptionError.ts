import { InvocationError } from './InvocationError'

export class MissingOptionError extends InvocationError {
	constructor(public option: string) {
		super(`Missing option: ${option}`)
	}
}
