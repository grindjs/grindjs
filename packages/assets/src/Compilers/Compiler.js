import fs from 'fs'
import path from 'path'

export class Compiler {
	app = null
	autoMinify = null
	supportedExtensions = [ ]

	constructor(app, autoMinify) {
		this.app = app
		this.autoMinify = autoMinify
	}

	// eslint-disable-next-line no-unused-vars
	supports(pathname) {
		return this.supportedExtensions.indexOf(path.extname(pathname).replace(/^\./, '')) >= 0
	}

	// eslint-disable-next-line no-unused-vars
	compile(pathname, context = null) {
		return Promise.reject('Abstract method, subclasses must implement.')
	}

	lastModified(pathname, newest = 0) {
		return new Promise((resolve, reject) => {
			fs.stat(pathname, (err, stats) => {
				if(!err.isNil) {
					if(err.code === 'ENOENT') {
						return resolve(newest)
					}

					return reject(err)
				}

				const timestamp = (new Date(stats.mtime)).getTime() / 1000.0
				newest = Math.max(newest, timestamp)

				this.enumerateImports(
					pathname, pathname => this.lastModified(pathname, newest)
				).then(() => resolve(newest))
			})
		})
	}

	// eslint-disable-next-line no-unused-vars
	enumerateImports(file, callback) {
		// Does nothing by default, subclasses that support imports
		// should override and provider their own implementation.
		return Promise.resolve()
	}

	get mime() { throw new Error('Abstract method, subclasses must implement.') }
	get type() { throw new Error('Abstract method, subclasses must implement.') }
	get extension() { throw new Error('Abstract method, subclasses must implement.') }

}
