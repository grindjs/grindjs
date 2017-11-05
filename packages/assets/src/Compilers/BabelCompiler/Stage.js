export class Stage {

	static configName = null
	handleBabel = true
	enabled = true
	sourceMaps = null

	constructor(sourceMaps) {
		this.sourceMaps = sourceMaps
	}

	compile(/* pathname, stream = null */) {

	}

}
