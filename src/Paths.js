const path = require('path')
const fs = require('fs')

export class Paths {

	_base = null
	_app = null
	_config = null
	_database = null
	_package = null
	_public = null

	constructor(base = null) {
		this._base = base || this.findBase()
		this._app = path.join(this._base, 'app')
		this._config = path.join(this._base, 'config')
		this._database = path.join(this._base, 'database')
		this._public = path.join(this._base, 'public')
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

	public(...args) {
		return this._join(this._public, ...args)
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

	findBase() {
		if(!process.env.APP_BASE.isNil) {
			return process.env.APP_BASE
		}

		const test = /\/pm2|mocha|ava|forever\//i
		let parent = module

		while(!parent.parent.isNil && !test.test(parent.parent.filename)) {
			parent = parent.parent
		}

		let dirname = path.dirname(parent.filename)

		// eslint-disable-next-line no-sync
		while(dirname !== '/' && dirname !== '.' && !fs.existsSync(path.join(dirname, 'package.json'))) {
			dirname = path.dirname(dirname)
		}

		if(dirname === '/' || dirname === '.') {
			throw new Error('Could not find base path.')
		}

		return dirname
	}

}
