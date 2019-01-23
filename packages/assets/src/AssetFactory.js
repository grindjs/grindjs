import './Asset'
import './Compilers/Compiler'
import './PostProcessors/PostProcessor'

const path = require('path')

export class AssetFactory {

	app = null
	published = null
	shouldOptimizeDefault = null
	sourceMapsDefault = false
	liveReload = false

	_compilers = [ ]
	_postProcessors = [ ]

	constructor(app, shouldOptimizeDefault = false, sourceMapsDefault = 'auto', liveReload = false) {
		this.app = app
		this.published = app.config.get('assets-published', { })
		this.shouldOptimizeDefault = shouldOptimizeDefault
		this.sourceMapsDefault = sourceMapsDefault
		this.liveReload = liveReload
	}

	make(path) {
		return new Asset(path, this.getCompilerFromPath(path))
	}

	registerCompiler(compiler) {
		if(typeof compiler === 'function') {
			compiler = new compiler(this.app, this.sourceMapsDefault, this.liveReload)
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

	normalizePath(pathname) {
		if(pathname.indexOf('://') !== -1) {
			return pathname
		}

		return pathname.replace(/^(\/)?(assets\/)?/, '')
	}

	publishedPath(pathname) {
		pathname = this.normalizePath(pathname)
		return this.published[pathname] || path.join('/assets', pathname)
	}

}
