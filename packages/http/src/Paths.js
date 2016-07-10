import path from 'path'
import findRoot from 'find-root'

export class Paths {
	_base = null
	_app = null
	_config = null
	_database = null
	_package = null

	constructor(bootstrapper) {
		this._base = findRoot(bootstrapper)
		this._app = path.join(this._base, 'app')
		this._config = path.join(this._base, 'config')
		this._database = path.join(this._base, 'database')
		this._package = path.join(this._base, 'package.json')
	}

	base(...args) {
		return this._join(this._base, ...args)
	}

	app(...args) {
		return this._join(this._app, ...args)
	}

	config(...args) {
		return this._join(this._config, ...args)
	}

	database(...args) {
		return this._join(this._database, ...args)
	}

	get package() {
		return this._package
	}

	_join(rootPath, ...args) {
		if(args.length > 0) {
			args.unshift(rootPath)
			return path.join(...args)
		}

		return rootPath
	}

}
