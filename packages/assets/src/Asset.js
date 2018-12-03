export class Asset {

	compiler = null
	path = null

	constructor(path, compiler) {
		this.path = path
		this.compiler = compiler
	}

	compile(context = null, req = null) {
		return this.compiler.compile(this.path, context, req)
	}

	lastModified(newest = 0) {
		return this.compiler.lastModified(this.path, newest)
	}

	get mime() {
		return this.compiler.mime(this)
	}

	get type() {
		return this.compiler.type(this)
	}

	get extension() {
		return this.compiler.extension(this)
	}

}
