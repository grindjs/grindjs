import { Paths as BasePaths } from 'grind-framework'

const path = require('path')

export class Paths extends BasePaths {

	_project = null
	_packages = null
	_packageInfo = null
	_bootstrap = null

	constructor(...args) {
		super(...args)

		this._project = process.cwd()
		this._packages = path.join(this._project, 'node_modules')
		this._packageInfo = path.join(this._project, 'package.json')
		this._bootstrap = path.join(this._project, 'app/Bootstrap.js')
	}

	project(...args) {
		return this._join(this._project, ...args)
	}

	packages(...args) {
		return this._join(this._packages, ...args)
	}

	get packageInfo() {
		return this._packageInfo
	}

	get bootstrap() {
		return this._bootstrap
	}

}
