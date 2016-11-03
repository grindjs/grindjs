import './Asset'
import './Compilers/Compiler'
import './PostProcessors/PostProcessor'

import path from 'path'

export class AssetFactory {
	app = null
	published = null
	shouldOptimizeDefault = null
	sourceMapsDefault = false

	_compilers = [ ]
	_postProcessors = [ ]

	constructor(app, shouldOptimizeDefault = false, sourceMapsDefault = 'auto') {
		this.app = app
		this.published = app.config.get('assets-published', { })
		this.shouldOptimizeDefault = shouldOptimizeDefault
		this.sourceMapsDefault = sourceMapsDefault
	}

	make(path) {
		return new Asset(path, this.getCompilerFromPath(path))
	}

	registerCompiler(compiler) {
		if(typeof compiler === 'function') {
			compiler = new compiler(this.app, this.sourceMapsDefault)
		}

		if(!(compiler instanceof Compiler)) {
			throw new Error('Compilers must extend Compiler')
		}

		this._compilers.push(compiler)
		this._compilers.sort((a, b) => a.priority > b.priority ? -1 : 1)
	}

	registerPostProcessor(postProcessor) {
		if(typeof postProcessor === 'function') {
			postProcessor = new postProcessor(this.app, this.shouldOptimizeDefault, this.sourceMapsDefault)
		}

		if(!(postProcessor instanceof PostProcessor)) {
			throw new Error('PostProcessors must extend PostProcessor')
		}

		this._postProcessors.push(postProcessor)
		this._postProcessors.sort((a, b) => a.priority > b.priority ? -1 : 1)
	}

	getCompilerFromPath(path) {
		for(const compiler of this._compilers) {
			if(compiler.supports(path)) {
				return compiler
			}
		}

		throw new BadRequestError(`Unsupported asset path: ${path}`)
	}

	getPostProcessorsFromPath(path) {
		return this._postProcessors.filter(postProcessor => postProcessor.supports(path))
	}

	isPathSupported(path) {
		try {
			this.getCompilerFromPath(path)
			return true
		} catch(e) {
			return false
		}
	}

	publishedPath(pathname, req, secure = null) {
		if(pathname.indexOf('assets/') !== 0) {
			pathname = path.join('assets', pathname)
		}

		const publishedPath = this.published[pathname]

		if(!publishedPath.isNil) {
			pathname = publishedPath
		}

		if(pathname.indexOf('://') !== -1) {
			return pathname
		}

		return this.app.url.make(pathname, null, req, secure)
	}

}
