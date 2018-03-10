import './OutputFormatter'

import '../Errors/InvocationError'

export class Output {

	app = null
	formatter = null

	constructor(app, formatter = new OutputFormatter) {
		this.app = app
		this.formatter = formatter
	}

	writeln(...messages) {
		return this._write(messages, true)
	}

	write(...messages) {
		return this._write(messages, false)
	}

	_write(messages, newLine) {
		messages[0] = this.formatter.format(messages[0])

		if(newLine) {
			console.log(...messages)
		} else {
			process.stdout.write(...messages)
		}
	}

	writeError(err) {
		let message = null

		if(err instanceof InvocationError) {
			message = `${err.message}`
		} else {
			message = (err.stack || err).toString()
		}

		if(!this.formatter.decorated) {
			return this.writeln(message)
		}

		const lines = message.split(/\n/)
		const maxLength = Math.min(
			(process.stdout.columns || 80) - 4,
			Array.from(lines).sort((a, b) => a.length > b.length ? -1 : 1)[0].length
		)

		this.writeln('')
		this.writeln(`<error>  ${''.padStart(maxLength, ' ')}  </error>`)

		for(const line of lines) {
			this.writeln(`<error>  ${line.padEnd(maxLength, ' ')}  </error>`)
		}

		this.writeln(`<error>  ${''.padStart(maxLength, ' ')}  </error>`)
		this.writeln('')
	}

}
