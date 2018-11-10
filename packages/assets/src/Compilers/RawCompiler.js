import './Compiler'

import { FS } from 'grind-support'
const path = require('path')

export class RawCompiler extends Compiler {

	wantsHashSuffixOnPublish = false
	directories = [ ]
	mimes = null
	assets = null

	constructor(app, ...args) {
		super(app, ...args)

		this.assets = app.paths.base(app.config.get('assets.paths.source'))
		this.mimes = app.config.get('assets.compilers.raw.mimes')
		this.shouldProcessJs = app.config.get('assets.babel.allow_vanilla_js')
		this.topLevel = app.config.get('assets.top_level')

		if(this.topLevel) {
			this.supportedExtensions = Object.keys(this.mimes)

			if(!this.shouldProcessJs) {
				this.supportedExtensions = this.supportedExtensions.filter(ext => ext !== 'js')
			}
		} else {
			for(const directory of app.config.get('assets.compilers.raw.directories', [ ])) {
				this.directories.push(path.join(this.assets, directory, '/'))
			}
		}
	}

	compile(pathname) {
		return FS.readFile(pathname)
	}

	supports(pathname) {
		if(this.topLevel) {
			return super.supports(pathname)
		}

		const ext = path.extname(pathname).toLowerCase().substring(1)

		for(const directory of this.directories) {
			if(pathname.indexOf(directory) === 0 && typeof this.mimes[ext] === 'string') {
				return true
			}
		}

		return false
	}

	mime(asset) {
		const ext = path.extname(asset.path).toLowerCase().substring(1)
		return this.mimes[ext] || 'text/plain'
	}

	type(asset) {
		for(const directory of this.directories) {
			if(asset.path.indexOf(directory) === 0) {
				return path.basename(directory)
			}
		}

		return 'unknown'
	}

	extension(asset) {
		return path.extname(asset.path).substring(1)
	}

}
