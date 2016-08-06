import './Asset'
import './Compilers/Compiler'

import path from 'path'

export class AssetFactory {
	app = null
	published = null
	autoMinifyDefault = null
	_compilers = [ ]

	constructor(app, autoMinifyDefault = false) {
		this.app = app
		this.published = app.config.get('assets-published', { })
		this.autoMinifyDefault = autoMinifyDefault
	}

	make(path) {
		return new Asset(path, this.getCompilerFromPath(path))
	}

	registerCompiler(compiler) {
		if(typeof compiler === 'function') {
			compiler = new compiler(this.app, this.autoMinifyDefault)
		}

		if(!(compiler instanceof Compiler)) {
			throw new Error('Compilers must extend Compiler')
		}

		this._compilers.push(compiler)
		this._compilers.sort((a, b) => a.priority > b.priority ? -1 : 1)
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

	publishedPath(pathname) {
		if(pathname.indexOf('assets/') !== 0) {
			pathname = path.join('assets', pathname)
		}

		const publishedPath = this.published[pathname]

		if(!publishedPath.isNil) {
			pathname = publishedPath
		}

		if(pathname.indexOf('://') === -1) {
			return this.app.url.make(pathname)
		}

		return pathname
	}

}
