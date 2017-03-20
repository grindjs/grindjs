const path = require('path')

export class StoneError extends Error {

	constructor(context, message) {
		super(message)

		this.name = this.constructor.name
		this.file = context.state.file || '[stone]'
	}

	_fixStack(context, position) {
		const { line, column } = context.findLineColumn(position)
		const templateName = path.basename(this.file, '.stone')

		this.stack = this.stack.replace(/^(\s+)at/m, ($0, $1) => {
			return `${$1}at ${templateName}.render (${this.file}:${line}:${column})\n${$0}`
		})
	}

}
