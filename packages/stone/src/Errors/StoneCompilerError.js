import './StoneError'

export class StoneCompilerError extends StoneError {

	constructor(context, message) {
		super(context, message)

		let line = 0
		let column = 1
		let position = context.state.index

		for(const length of context.template.lines) {
			line++

			if(position >= length) {
				position -= length
				continue
			}

			column = position + 1
			break
		}

		this.stack = this.stack.replace(/^(\s+)at/m, ($0, $1) => {
			return `${$1}at ${this.file}:${line}:${column}\n${$0}`
		})
	}

}
