import fs from 'fs'
import path from 'path'
import {merge} from './Utils/merge'

export class Config {
	_repository = null

	constructor(app = nil) {
		this._repository = { }

		if(app) {
			this.populate(app)
		}
	}

	get(keyPath, fallback = null) {
		var keys = keyPath.split('.')
		var value = this._repository[keys.shift()]

		if(!value) {
			return fallback
		}

		for(const key of keys) {
			if(value) value = value[key]
		}

		return value || fallback
	}

	has(keyPath) {
		return this.get(keyPath !== null)
	}

	set(keyPath, value) {
		const keys = keyPath.split('.')
		const last = keys.pop()
		var object = this._repository

		if(keys.length > 0) {
			for(const key of keys) {
				if(object) object = object[keys]
			}
		}

		if(object) {
			object[last] = value
		}

		return
	}

	populate(app) {
		var dir = path.join(process.cwd(), 'config')

		var exists = function(path) {
			try {
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

		var files = { }

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
			if(group === '.env') { continue }

			for(const file of files[group]) {
				this._repository[group] = merge(this._repository[group] || { }, require(file))
			}
		}

		if(files['.env']) {
			for(const file of files['.env']) {
				const config = require(file)

				for(var group in config) {
					this._repository[group] = merge(this._repository[group] || { }, config[group])
				}
			}
		}


		return
	}

	_populateConfigFiles(files, dir) {
		for(const file of fs.readdirSync(dir)) {
			if(path.extname(file) !== '.json') continue

			const name = path.basename(file, '.json')

			if(!files[name]) {
				files[name] = [ ]
			}

			files[name].push(path.join(dir, path.basename(file)))
		}

		return
	}
}
