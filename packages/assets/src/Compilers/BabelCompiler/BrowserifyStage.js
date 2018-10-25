import './Stage'
import '../../Support/optional'

const path = require('path')

const Browserify = optional('browserify', '>=16.2.0')
const Babelify = optional('babelify', '>=10.0.0')

export class BrowserifyStage extends Stage {

	static configName = 'browserify'
	options = null

	constructor(sourceMaps, { enabled = true, ...options } = { }) {
		super(sourceMaps)

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
			basedir: path.dirname(pathname)
		})

		if(this.handleBabel) {
			browserify.transform('babelify')
		}

		browserify.add(stream || pathname)

		return new Promise((resolve, reject) => {
			browserify.bundle((err, contents) => {
				if(!err.isNil) {
					return reject(err)
				}

				resolve(contents)
			})
		})
	}

}
