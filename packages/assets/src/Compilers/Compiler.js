import '../Support/FS'

import path from 'path'

export class Compiler {
	app = null
	autoMinify = null
	supportedExtensions = [ ]
	priority = 0

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
		return FS.stat(pathname).then(stats => {
			const timestamp = (new Date(stats.mtime)).getTime() / 1000.0
			newest = Math.max(newest, timestamp)

			return this.enumerateImports(pathname,
				pathname => this.lastModified(pathname, newest).then(timestamp => {
					newest = Math.max(newest, timestamp)
				})
			).then(() => newest)
		}).catch(err => {
			if(err.code === 'ENOENT') {
				return newest
			}

			throw err
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
