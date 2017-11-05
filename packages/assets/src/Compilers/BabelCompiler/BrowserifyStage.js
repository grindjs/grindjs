import './Stage'
import { MissingPackageError } from 'grind-framework'

const path = require('path')
const optional = require('optional')

const Browserify = optional('browserify')
const Babelify = optional('babelify')

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
		if(Browserify.isNil) {
			return Promise.reject(new MissingPackageError('browserify', 'dev'))
		}

		if(this.handleBabel && Babelify.isNil) {
			return Promise.reject(new MissingPackageError('babelify', 'dev'))
		}

		const browserify = Browserify({
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
