import './Stage'

import '../../Errors/makeSyntaxError'
import '../../Support/optional'

const Browserify = optional('browserify', '>=16.2.0')
const Babelify = optional('babelify', '>=10.0.0')

export class BrowserifyStage extends Stage {

	static configName = 'browserify'
	options = null

	constructor(app, sourceMaps, { enabled = true, ...options } = { }) {
		super(app, sourceMaps)

		this.browserifyOptions = {
			debug: this.sourceMaps === 'auto',
			...options
		}

		this.enabled = enabled
	}

	compile(pathname, stream = null) {
		Browserify.assert()

		if(this.handleBabel && Babelify.isNil) {
			Babelify.assert()
		}

		const browserify = Browserify.pkg({
			...this.options,
			basedir: this.app.paths.base()
		})

		if(this.handleBabel) {
			browserify.transform('babelify')
		}

		browserify.add(stream || pathname)

		return new Promise((resolve, reject) => {
			browserify.bundle((err, contents) => {
				if(!err.isNil) {
					if(!(err instanceof SyntaxError)) {
						return reject(err)
					}

					let message = err.message
					message = err.message.split(/\n/)[0]
					message = message.substring(message.indexOf(':') + 1).trim()

					const loc = err.loc || { }

					return makeSyntaxError(this.app, {
						message,
						lineNumber: loc.line,
						columnNumber: loc.column,
						causedBy: err
					}).catch(reject).then(reject)
				}

				resolve(contents)
			})
		})
	}

}
