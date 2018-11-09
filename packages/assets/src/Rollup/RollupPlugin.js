const { createFilter } = require('rollup-pluginutils')
const path = require('path')

export class RollupPlugin {

	config

	constructor(options) {
		this.filter = createFilter(options.include, options.exclude)
		this.config = options
	}

	static pkg(options) {
		return new this(options)
	}

	static assert() {
		// Do nothing
	}

	load = id => {
		if(!this.filter(id)) {
			return null
		}

		if(!this.extensions.has(path.extname(id).toLowerCase().substring(1))) {
			return null
		}

		id = path.relative(this.config.grind.config.get('assets.paths.source'), id)
		return this.transformPath(this.config.grind.assets.publishedPath(id))
	}

	transformPath(/* file */) {
		return null
	}

	compiler(compiler) {
		return new compiler(this.config.grind, true, true)
	}

	get name() {
		return this.constructor.name
	}

}
