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

	compareKind(other) {
		const delta = this.kindPriority - other.kindPriority

		if(delta !== 0) {
			return delta < 0 ? -1 : 1
		}

		return Math.min(1, Math.max(-1, this.path.localeCompare(other.path)))
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

	get kind() {
		return this.compiler.kind
	}

	get kindPriority() {
		switch(this.compiler.kind) {
			case 'script':
				return -1
			case 'style':
				return 5
			case 'raw':
				return 10
			default:
				return 0
		}
	}

}
