export class Stage {

	static configName = null

	app = null
	handleBabel = true
	enabled = true
	sourceMaps = null

	constructor(app, sourceMaps) {
		this.sourceMaps = sourceMaps
		this.app = app
	}

	compile(/* pathname, stream = null, req = null */) {

	}

}
