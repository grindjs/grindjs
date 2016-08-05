import './Asset'
import './Compilers/Compiler'

export class AssetFactory {
	app = null
	published = null
	autoMinifyDefault = false
	_compilers = [ ]

	constructor(app) {
		this.app = app
		this.published = app.config.get('assets-published')
	}

	make(path) {
		return new Asset(path, this.getCompilerFromPath(path))
	}

	registerCompiler(compiler) {
		if(!(compiler instanceof Compiler)) {
			throw new Error('Compilers must extend Compiler')
		}

		this._compilers.push(compiler)
	}

	getCompilerFromPath(path) {
		for(const compiler of this._compilers) {
			if(compiler.supports(path)) {
				return compiler
			}
		}

		throw new BadRequestError(`Unsupported asset path: ${path}`)
	}

	isPathSupported(path) {
		try {
			this.getCompilerFromPath(path)
			return true
		} catch(e) {
			return false
		}
	}

	publishedPath(path) {
		if(this.published.isNil) {
			return path
		}

		if(path.indexOf('assets/') !== 0) {
			path = `assets/${path}`
		}

		const publishedPath = this.published[path]

		if(!publishedPath.isNil) {
			path = publishedPath
		}

		if(path.indexOf('://') === -1) {
			return app.url.make(path)
		}

		return path
	}

}
