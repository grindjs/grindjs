import './StoneError'

export class StoneSyntaxError extends StoneError {

	constructor(context, err, position) {
		const { line: sourceLine, column: sourceColumn } = context.findLineColumn(position)

		const message = err.message.replace(/\((\d+):(\d+)\)/, (_, line) => {
			line = sourceLine + Number.parseInt(line) - 1
			return `(${line}:${sourceColumn})`
		})

		super(context, message)

		this._fixStack(context, position)
	}

}
