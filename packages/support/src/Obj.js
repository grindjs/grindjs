export class Obj {

	static get(object, keyPath, fallback) {
		if(arguments.length < 3) {
			fallback = null
		}

		if(object.isNil) {
			return fallback
		}

		const keys = keyPath.split('.')
		let value = object[keys.shift()]

		if(value.isNil) {
			return fallback
		}

		for(const key of keys) {
			if(value.isNil) {
				continue
			}

			value = value[key]
		}

		if(value.isNil) {
			return fallback
		}

		return value
	}

	static has(object, keyPath) {
		return this.get(object, keyPath, void 0) !== void 0
	}

	static set(object, keyPath, value) {
		const keys = keyPath.split('.')
		const last = keys.pop()

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

	static filter(object, callback) {
		object = object || { }
		const filtered = { }

		for(const [ key, value ] of Object.entries(object)) {
			if(!callback(key, value)) {
				continue
			}

			filtered[key] = value
		}

		return filtered
	}

	static only(object, keys) {
		keys = new Set(keys)
		return this.filter(object, key => keys.has(key))
	}

}
