import path from 'path'

export class PostProcessor {
	app = null
	priority = 0
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
	process(pathname, context = null) {
		return Promise.reject('Abstract method, subclasses must implement.')
	}

	/* eslint-disable no-unused-vars */
	type(asset) { throw new Error('Abstract method, subclasses must implement.') }
	/* eslint-enable no-unused-vars */

}
