export class Asset {
	compiler = null
	path = null

	constructor(path, compiler) {
		this.path = path
		this.compiler = compiler
	}

	compile(context = null) {
		return this.compiler.compile(this.path, context)
	}

	lastModified(newest = 0) {
		return this.compiler.lastModified(this.path, newest)
	}

	get mime() {
		return this.compiler.mime
	}

	get type() {
		return this.compiler.type
	}

	get extension() {
		return this.compiler.extension
	}

}
