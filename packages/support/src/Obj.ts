export class Obj {
	static get<T>(
		object: Record<string, any> | null | undefined,
		keyPath: string,
		fallback?: T | null | undefined,
	): T | null | undefined {
		if (arguments.length < 3) {
			fallback = null
		}

		if (object === null || object === undefined) {
			return fallback
		}

		const keys = keyPath.split('.')
		let value = object[keys.shift()!]

		for (const key of keys) {
			value = value?.[key]
		}

		return value ?? fallback
	}

	static has(object: Record<string, any>, keyPath: string) {
		return this.get(object, keyPath, undefined) !== undefined
	}

	static set(object: Record<string, any> | null | undefined, keyPath: string, value: any) {
		const keys = keyPath.split('.')
		const last = keys.pop()!

		for (const key of keys) {
			object = object?.[key]
		}

		if (object) {
			object[last] = value
		}
	}

	static delete(object: Record<string, any> | null | undefined, keyPath: string) {
		const keys = keyPath.split('.')
		const last = keys.pop()!

		for (const key of keys) {
			object = object?.[key]
		}

		if (object) {
			delete object[last]
		}
	}

	static filter(
		object: Record<string, any> | null | undefined,
		callback: (key: string, value: any) => boolean,
	): Record<string, any> {
		object = object || {}
		const filtered: Record<string, any> = {}

		for (const [key, value] of Object.entries(object)) {
			if (!callback(key, value)) {
				continue
			}

			filtered[key] = value
		}

		return filtered
	}

	static only(object: Record<string, any> | null | undefined, keys: Iterable<string>) {
		keys = new Set(keys)
		return this.filter(object, key => (keys as Set<string>).has(key))
	}

	static except(object: Record<string, any> | null | undefined, keys: Iterable<string>) {
		keys = new Set(keys)
		return this.filter(object, key => !(keys as Set<string>).has(key))
	}

	static keyBy(items: any[], field: string, hasSingleValue = true): Record<string, any> {
		const object: Record<string, any> = {}

		for (const result of items) {
			const key = result[field]

			if (!key) {
				continue
			}

			if (hasSingleValue) {
				object[key] = result
				continue
			}

			let values = object[key]

			if (!Array.isArray(values)) {
				values = []
				object[key] = values
			}

			values.push(result)
		}

		return object
	}
}
