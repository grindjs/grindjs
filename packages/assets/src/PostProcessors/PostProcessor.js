import path from 'path'

export class PostProcessor {
	app = null
	priority = 0
	supportedExtensions = [ ]

	constructor(app, shouldOptimize) {
		this.app = app
		this.shouldOptimize = shouldOptimize
	}

	// eslint-disable-next-line no-unused-vars
	supports(sourcePath) {
		return this.supportedExtensions.indexOf(path.extname(sourcePath).replace(/^\./, '')) >= 0
	}

	// eslint-disable-next-line no-unused-vars
	process(sourcePath, targetPath, contents) {
		return Promise.reject('Abstract method, subclasses must implement.')
	}

}
