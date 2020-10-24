import { InvocationError } from './InvocationError'

export class CommandNotFoundError extends InvocationError {
	constructor(public command: string) {
		super(`Command not found: ${command}`)
	}
}
