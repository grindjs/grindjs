import '../Command'
import repl from 'repl'

export class TinkerCommand extends Command {
	name = 'tinker'
	description = 'Starts a REPL within the context of your app'

	run() {
		return new Promise(resolve => {
			const r = repl.start({
				prompt: '> '
			})

			this._setup(r)
			r.eval = this._asyncEval(r)

			r.on('reset', r => this._setup(r))
			r.on('exit', resolve)
		})
	}

	_setup(r) {
		r.context.app = this.app
	}

	_asyncEval(r) {
		const _eval = r.eval
		return (cmd, context, filename, callback) => {
			_eval.call(r, cmd, context, filename, async (err, result) => {
				if(!err.isNil) {
					return callback(err, result)
				}

				if(result.isNil || typeof result.then !== 'function') {
					return callback(err, result)
				}

				try {
					const resolved = await result
					result = resolved
				} catch(e) {
					err = e
				}

				callback(err, result)
			})
		}
	}

}
