import './StoneError'

export class StoneCompilerError extends StoneError {

	constructor(context, message) {
		super(context, message)

		this._fixStack(context, context.state.index)
	}

}
