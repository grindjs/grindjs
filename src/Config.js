const fs = require('fs')
const path = require('path')
const JSON5 = require('json5')

import { Obj, merge } from 'grind-support'

export class Config {
	_repository = null

	constructor(app = null) {
		this._repository = { }

		if(!app.isNil) {
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
		const config = JSON5.parse(fs.readFileSync(file))
		const existing = this._repository[group] || { }
		this._repository[group] = merge(merge({ }, config), existing)
	}

	populate(app) {
		let dir = app.paths.config()

		const exists = path => {
			try {
				// eslint-disable-next-line no-sync
				fs.accessSync(path, fs.F_OK)
				return true
			} catch(e) {
				return false
			}
		}

		if(!exists(dir)) {
			Log.error('Unable to populate config, path does not exist', dir)
			return
		}

		const files = { }

		this._populateConfigFiles(files, dir)

		for(const env of app.env().split('.')) {
			dir = path.join(dir, env)

			if(!exists(dir)) {
				break
			}

			this._populateConfigFiles(files, dir)
		}

		for(const group in files) {
			if(group === '.env') {
				continue
			}

			for(const file of files[group]) {
				// eslint-disable-next-line no-sync
				const config = JSON5.parse(fs.readFileSync(file))
				this._repository[group] = merge(this._repository[group] || { }, config)
			}
		}

		if(!files['.env']) {
			return
		}

		for(const file of files['.env']) {
			// eslint-disable-next-line no-sync
			const config = JSON5.parse(fs.readFileSync(file))

			for(const group in config) {
				this._repository[group] = merge(this._repository[group] || { }, config[group])
			}
		}
	}

	_populateConfigFiles(files, dir) {
		// eslint-disable-next-line no-sync
		for(const file of fs.readdirSync(dir)) {
			if(path.extname(file) !== '.json') {
				continue
			}

			const name = path.basename(file, '.json')

			if(!files[name]) {
				files[name] = [ ]
			}

			files[name].push(path.join(dir, path.basename(file)))
		}
	}
}
