import { InvocationError } from './InvocationError'

export class MissingArgumentError extends InvocationError {
	constructor(public argument: string) {
		super(`Missing argument: ${argument}`)
	}
}
