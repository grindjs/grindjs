import { Store } from 'cache-manager'

// NOTE: Not implementing Store as the typings are useless

type CallbackParam = ((error: Error, result?: any) => void) | undefined

class DatabaseStore {
	db: import('knex')
	name = 'database'
	table: string
	usePromises = true
	_ttl: number

	constructor(options: {
		connection: import('knex')
		table?: string
		ttl?: number
		noPromises?: boolean
	}) {
		this.db = options.connection
		this.table = options.table || 'cache'
		this._ttl = options.ttl || 60
		this.usePromises = options.noPromises !== true
	}

	set(
		key: string,
		value: any,
		options?: CallbackParam | Record<string, any>,
		callback?: CallbackParam,
	) {
		if (typeof options === 'function') {
			callback = options as any
			options = undefined
		}

		options = options || {}
		value = JSON.stringify(value) || null

		const expires = new Date(Date.now() + (options.ttl || this._ttl) * 1000)
		const values = { key, value, expires_at: expires }

		return this._wrapPromise(
			callback,
			this.db(this.table)
				.insert(values)
				.catch(() => this.db(this.table).where({ key }).update(values)),
		)
	}

	get(key: string, options?: Record<string, any> | CallbackParam, callback?: CallbackParam) {
		if (typeof options === 'function') {
			callback = options as any
			options = undefined
		}

		return this._wrapPromise(
			callback,
			this.db(this.table)
				.where({ key })
				.first()
				.then(value => {
					if (value.isNil) {
						return null
					}

					if (value.expires_at < Date.now()) {
						return this.del(key)
							?.catch(() => null)
							.then(() => null)
					}

					value = JSON.parse(value.value)

					if (typeof value.type === 'string' && value.type === 'Buffer') {
						return Buffer.from(value.data)
					}

					return value
				}),
		)
	}

	del(key: string, options?: CallbackParam | Record<string, any>, callback?: CallbackParam) {
		if (typeof options === 'function') {
			callback = options as CallbackParam
			options = undefined
		}

		return this._wrapPromise(callback, this.db(this.table).where({ key }).delete())
	}

	reset(callback?: CallbackParam) {
		return this._wrapPromise(callback, this.db(this.table).delete())
	}

	keys(callback?: CallbackParam) {
		return this._wrapPromise(
			callback,
			this.db(this.table)
				.select('key')
				.then(keys => keys.map(key => key.key)),
		)
	}

	_wrapPromise(callback: CallbackParam, promise: Promise<any>): Promise<any> | undefined {
		return promise
			.then(value => {
				if (typeof callback !== 'function') {
					return value
				}

				process.nextTick(callback.bind(null, null, value))
			})
			.catch(err => {
				if (typeof callback !== 'function') {
					throw err
				}

				process.nextTick(callback.bind(null, err))
			})
	}

	static create(...args: any[]): Store {
		return new this(args[0].options) as Store
	}
}

export const create = DatabaseStore.create.bind(DatabaseStore)
