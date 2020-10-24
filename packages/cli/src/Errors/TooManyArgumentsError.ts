import { InvocationError } from './InvocationError'

export class TooManyArgumentsError extends InvocationError {
	constructor() {
		super('Too many arguments')
	}
}
