import './StoneError'

export class StoneCompilerError extends StoneError {

	constructor(context, message) {
		super(context, message)

		const { line, column } = context.findLineColumn(context.state.index)

		this.stack = this.stack.replace(/^(\s+)at/m, ($0, $1) => {
			return `${$1}at ${this.file}:${line}:${column}\n${$0}`
		})
	}

}
