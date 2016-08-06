import './Compiler'
import '../Support/FS'

import path from 'path'

export class RawCompiler extends Compiler {
	wantsHashSuffixOnPublish = false
	directories = [ ]
	extensions = null
	assets = null

	constructor(app, autoMinify) {
		super(app, autoMinify)

		this.assets = app.paths.base('resources/assets')
		this.extensions = app.config.get('assets.compilers.raw.extensions')

		for(const directory of app.config.get('assets.compilers.raw.directories', [ ])) {
			this.directories.push(path.join(this.assets, directory, '/'))
		}
	}

	compile(pathname) {
		return FS.readFile(pathname)
	}

	supports(pathname) {
		const ext = path.extname(pathname).toLowerCase().substring(1)

		for(const directory of this.directories) {
			if(pathname.indexOf(directory) === 0 && typeof this.extensions[ext] === 'string') {
				return true
			}
		}

		return false
	}

	mime(asset) {
		const ext = path.extname(asset.path).toLowerCase().substring(1)
		return this.extensions[ext] || 'text/plain'
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
