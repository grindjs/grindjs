const fs = require('fs')
const path = require('path')
const JSON5 = require('json5')

import { Obj, merge } from '@grindjs/support'

export class Config {
	_repository = null

	constructor(app = null) {
		this._repository = {}

		if (!app.isNil) {
			this.populate(app)
		}
	}

	get(keyPath, fallback = null) {
		return Obj.get(this._repository, keyPath, fallback)
	}

	has(keyPath) {
		return Obj.has(this._repository, keyPath)
	}

	set(keyPath, value) {
		Obj.set(this._repository, keyPath, value)
	}

	loadDefault(group, file) {
		// eslint-disable-next-line no-sync
		const config = this._loadConfigFile(file)
		const existing = this._repository[group] || {}
		this._repository[group] = merge(merge({}, config), existing)
	}

	populate(app) {
		let dir = app.paths.config()

		const exists = path => {
			try {
				// eslint-disable-next-line no-sync
				fs.accessSync(path, fs.F_OK)
				return true
			} catch (e) {
				return false
			}
		}

		if (!exists(dir)) {
			Log.error('Unable to populate config, path does not exist', dir)
			return
		}

		const files = {}

		this._populateConfigFiles(files, dir)

		for (const env of app.env().split('.')) {
			dir = path.join(dir, env)

			if (!exists(dir)) {
				break
			}

			this._populateConfigFiles(files, dir)
		}

		for (const group in files) {
			if (group === '.env') {
				continue
			}

			for (const file of files[group]) {
				const config = this._loadConfigFile(file)
				this._repository[group] = merge(this._repository[group] || {}, config)
			}
		}

		const env = []

		if (Array.isArray(files['.env']) && files['.env'].length > 0) {
			for (const file of files['.env']) {
				// eslint-disable-next-line no-sync
				env.push(this._loadConfigFile(file))
			}
		}

		if (typeof process.env.APP_CONFIG === 'string') {
			// eslint-disable-next-line no-sync
			env.push(JSON5.parse(process.env.APP_CONFIG))
		}

		if (env.length === 0) {
			return
		}

		const primitives = new Set(['bigint', 'boolean', 'number', 'string', 'undefined'])

		for (const config of env) {
			for (const [key, value] of Object.entries(config)) {
				if (primitives.has(typeof value) || value === null || key.indexOf('.') >= 0) {
					this.set(key, value)
				} else {
					this._repository[key] = merge(this._repository[key] || {}, value)
				}
			}
		}
	}

	_populateConfigFiles(files, dir) {
		// eslint-disable-next-line no-sync
		for (const file of fs.readdirSync(dir)) {
			const extname = path.extname(file)
			if (extname !== '.json' && extname !== '.js') {
				continue
			}

			const name = path.basename(file, extname)

			if (!files[name]) {
				files[name] = []
			}

			files[name].push(path.join(dir, path.basename(file)))
		}
	}

	_loadConfigFile(file) {
		const extname = path.extname(file)

		if (extname === '.json') {
			// eslint-disable-next-line no-sync
			return JSON5.parse(fs.readFileSync(file))
		} else if (extname !== '.js') {
			throw new Error(`Unsupported config file extension: ${extname}`)
		}

		const { default: config } = require(file) || {}

		if (config.isNil) {
			throw new Error(`Config files must contain a default export: ${file}`)
		}

		if (typeof config === 'function') {
			return config()
		} else if (typeof config === 'object') {
			return config
		}

		throw new Error(`Invalid config file export for default: ${file}`)
	}
}
