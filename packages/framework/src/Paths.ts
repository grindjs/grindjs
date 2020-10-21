import fs from 'fs'
import path from 'path'

export class Paths {
	_base: string
	_app: string
	_config: string
	_database: string
	_package: string
	_public: string

	constructor(base: string | null | undefined = null) {
		this._base = base || this.findBase()
		this._app = path.join(this._base, 'app')
		this._config = path.join(this._base, 'config')
		this._database = path.join(this._base, 'database')
		this._public = path.join(this._base, 'public')
		this._package = path.join(this._base, 'package.json')
	}

	base(...args: string[]): string {
		return this._join(this._base, ...args)
	}

	app(...args: string[]): string {
		return this._join(this._app, ...args)
	}

	config(...args: string[]): string {
		return this._join(this._config, ...args)
	}

	database(...args: string[]): string {
		return this._join(this._database, ...args)
	}

	public(...args: string[]): string {
		return this._join(this._public, ...args)
	}

	get package(): string {
		return this._package
	}

	_join(rootPath: string, ...args: string[]): string {
		if (args.length > 0) {
			args.unshift(rootPath)
			return path.join(...args)
		}

		return rootPath
	}

	findBase(): string {
		if (typeof process.env.APP_BASE === 'string') {
			return process.env.APP_BASE
		}

		const test = /\/pm2|mocha|ava|forever\//i
		let parent = module

		while (typeof parent.parent?.filename === 'string' && !test.test(parent.parent.filename)) {
			parent = parent.parent
		}

		let dirname = path.dirname(parent.filename)

		// eslint-disable-next-line no-sync
		while (
			dirname !== '/' &&
			dirname !== '.' &&
			!fs.existsSync(path.join(dirname, 'package.json'))
		) {
			dirname = path.dirname(dirname)
		}

		if (dirname === '/' || dirname === '.') {
			throw new Error('Could not find base path.')
		}

		return dirname
	}
}
