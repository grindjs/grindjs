import util from 'util'

import { Cli } from '../Cli'
import { InvocationError } from '../Errors/InvocationError'
import { OutputFormatter } from './OutputFormatter'

export class Output {
	constructor(public cli: Cli, public formatter = new OutputFormatter()) {}

	writeln(...messages: any[]) {
		return this._write(messages, true)
	}

	write(...messages: any[]) {
		return this._write(messages, false)
	}

	_write(messages: any[], newLine: boolean) {
		messages[0] = this.formatter.format(messages[0])

		if (newLine) {
			console.log(...messages)
		} else {
			process.stdout.write(util.format(messages[0], ...messages.slice(1)))
		}
	}

	writeError(error: Error) {
		let message = null

		if (error instanceof InvocationError) {
			message = `${error.message}`
		} else {
			message = (error.stack || error).toString()
		}

		if (!this.formatter.decorated) {
			return this.writeln(message)
		}

		const lines = message.split(/\n/)
		const maxLength = Math.min(
			(process.stdout.columns || 80) - 4,
			Array.from(lines).sort((a, b) => (a.length > b.length ? -1 : 1))[0].length,
		)

		this.writeln('')
		this.writeln(`<error>  ${''.padStart(maxLength, ' ')}  </error>`)

		for (const line of lines) {
			this.writeln(`<error>  ${line.padEnd(maxLength, ' ')}  </error>`)
		}

		this.writeln(`<error>  ${''.padStart(maxLength, ' ')}  </error>`)
		this.writeln('')
	}
}
