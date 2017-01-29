import './InvocationError'

export class CommandNotFoundError extends InvocationError {

	constructor(command) {
		super(`Command not found: ${command}`)

		this.command = command
	}

}
