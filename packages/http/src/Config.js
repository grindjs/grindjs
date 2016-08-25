import fs from 'fs'
import path from 'path'
import JSON5 from 'json5'
import { merge } from './Utils/merge'

export class Config {
	_repository = null

	constructor(app = null) {
		this._repository = { }

		if(!app.isNil) {
			this.populate(app)
		}
	}

	get(keyPath, fallback = null) {
		const keys = keyPath.split('.')
		let value = this._repository[keys.shift()]

		if(value.isNil) {
			return fallback
		}

		for(const key of keys) {
			if(value.isNil) {
				continue
			}

			value = value[key]
		}

		return value || fallback
	}

	has(keyPath) {
		const value = this.get(keyPath)
		return !value.isNil
	}

	set(keyPath, value) {
		const keys = keyPath.split('.')
		const last = keys.pop()
		let object = this._repository

		if(keys.length > 0) {
			for(const key of keys) {
				if(object.isNil) {
					continue
				}

				object = object[key]
			}
		}

		if(object) {
			object[last] = value
		}
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
			console.error('Unable to populate config, path does not exist', dir)
			return
		}

		const files = { }

		this._populateConfigFiles(files, dir)

		for(const env of app.env().split('.')) {
			dir = path.join(dir, env)

			if(exists(dir)) {
				this._populateConfigFiles(files, dir)
			} else {
				break
			}
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

		if(files['.env']) {
			for(const file of files['.env']) {
				// eslint-disable-next-line no-sync
				const config = JSON5.parse(fs.readFileSync(file))

				for(const group in config) {
					this._repository[group] = merge(this._repository[group] || { }, config[group])
				}
			}
		}
	}

	_populateConfigFiles(files, dir) {
		for(const file of fs.readdirSync(dir)) { // eslint-disable-line no-sync
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
