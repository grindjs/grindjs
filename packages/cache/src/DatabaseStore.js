class DatabaseStore {
	db = null
	name = 'database'
	table = null
	ttl = null
	usePromises = true

	constructor(options) {
		this.db = options.connection
		this.table = options.table || 'cache'
		this.ttl = options.ttl || 60
		this.usePromises = options.noPromises !== true
	}

	set(key, value, options, callback) {
		if(typeof options === 'function') {
			callback = options
			options = { }
		}

		options = options || { }
		value = JSON.stringify(value) || null

		const expires = new Date(Date.now() + ((options.ttl || this.ttl) * 1000))
		const values = { key, value, expires_at: expires }

		return this._wrapPromise(
			callback,
			this.db(this.table).insert(values).catch(() => this.db(this.table).where({ key }).update(values))
		)
	}

	get(key, options, callback) {
		if(typeof options === 'function') {
			callback = options
		}

		return this._wrapPromise(callback, this.db(this.table).where({ key }).first().then(value => {
			if(value.isNil) {
				return null
			}

			if(value.expires_at < Date.now()) {
				return this.del(key).catch(() => null).then(() => null)
			}

			value = JSON.parse(value.value)

			if(typeof value.type === 'string' && value.type === 'Buffer') {
				return new Buffer(value.data)
			}

			return value
		}))
	}

	del(key, options, callback) {
		if(typeof options === 'function') {
			callback = options
		}

		return this._wrapPromise(callback, this.db(this.table).where({ key }).delete())
	}

	reset(callback) {
		return this._wrapPromise(callback, this.db(this.table).delete())
	}

	keys(callback) {
		return this._wrapPromise(callback, this.db(this.table).select('key').then(keys => keys.map(key => key.key)))
	}

	_wrapPromise(callback, promise) {
		return promise.then(value => {
			if(callback.isNil) {
				return value
			}

			process.nextTick(callback.bind(null, null, value))
		}).catch(err => {
			if(callback.isNil) {
				throw err
			}

			process.nextTick(callback.bind(null, err))
		})
	}

	static create(options) {
		return new this(options.options)
	}

}

module.exports = {
	create: DatabaseStore.create.bind(DatabaseStore)
}
