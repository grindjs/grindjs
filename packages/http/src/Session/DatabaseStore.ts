//
// Adapted from express-mysql-session
// https://github.com/chill117/express-mysql-session/blob/03a4cc7/lib/index.js
//

import Application from '@grindjs/framework'
import { SessionData, Store } from 'express-session'

export class DatabaseStore extends Store {
	db: any = null
	table: string
	options: any
	private _expirationInterval: number | null = null

	constructor({
		app,
		connection,
		table,
		...options
	}: {
		app: Application
		connection: any
		table: string
	}) {
		super(options)

		if (!connection) {
			this.db = (app as any).db
		} else if (typeof connection === 'string') {
			this.db = require('@grindjs/db').DatabaseBuilder(connection, app)
		} else {
			this.db = connection
		}

		this.table = table || 'sessions'
		this.options = {
			checkExpirationInterval: 900000,
			expiration: 86400000,
			...options,
		}

		this.setExpirationInterval()
	}

	get(sessionId: string, callback: (err: any, session?: SessionData | null) => void) {
		try {
			return this.db(this.table)
				.select('data')
				.where({ id: sessionId })
				.first()
				.then((row: any) => {
					let session = null

					try {
						session = !row ? null : JSON.parse(row.data)
					} catch (err) {
						const error = new Error(`Failed to parse data for session: ${sessionId}`)

						if (callback) {
							return callback(error)
						}

						throw error
					}

					if (callback) {
						return callback(null, session)
					}

					return session
				})
				.catch((err: Error) => {
					if (!callback) {
						throw err
					}

					callback(err)
				})
		} catch (err) {
			if (!callback) {
				throw err
			}

			callback(err)
		}
	}

	set(sessionId: string, data: SessionData, callback?: (err?: any) => void) {
		try {
			let expires = null

			if (data.cookie) {
				if (data.cookie.expires) {
					expires = data.cookie.expires
				} else if ((data.cookie as any)._expires) {
					expires = (data.cookie as any)._expires
				}
			}

			if (!expires) {
				expires = Date.now() + this.options.expiration
			}

			if (!(expires instanceof Date)) {
				expires = new Date(expires)
			}

			// Use whole seconds here; not milliseconds.
			const row = {
				id: sessionId,
				data: JSON.stringify(data),
				expires_at: expires,
			}

			return this.db(this.table)
				.insert(row)
				.catch(() => {
					return this.db(this.table).where({ id: sessionId }).update(row)
				})
				.then(() => {
					if (callback) {
						return callback()
					}
				})
				.catch((err: any) => {
					if (callback) {
						return callback(err)
					}

					throw err
				})
		} catch (err) {
			if (!callback) {
				throw err
			}

			callback(err)
		}
	}

	touch(sessionId: string, data: SessionData, callback?: (err?: any) => void): void {
		try {
			let expires = null

			if (data.cookie) {
				if (data.cookie.expires) {
					expires = data.cookie.expires
				} else if ((data.cookie as any)._expires) {
					expires = (data.cookie as any)._expires
				}
			}

			if (!expires) {
				expires = Date.now() + this.options.expiration
			}

			if (!(expires instanceof Date)) {
				expires = new Date(expires)
			}

			return this.db(this.table)
				.where({ id: sessionId })
				.update({ expires_at: expires })
				.then(() => {
					if (!callback) {
						return
					}

					return callback()
				})
				.catch((err: any) => {
					if (callback) {
						return callback(err)
					}

					throw err
				})
		} catch (err) {
			if (!callback) {
				throw err
			}

			callback(err)
		}
	}

	destroy(sessionId: string, callback?: (err?: any, count?: number) => void) {
		try {
			return this.db(this.table)
				.where({ id: sessionId })
				.delete()
				.then((count: number | string) => {
					count = Number.parseInt(count.toString()) || 0

					if (!callback) {
						return count
					}

					return callback(null, count)
				})
				.catch((err: any) => {
					if (callback) {
						return callback(err)
					}

					throw err
				})
		} catch (err) {
			if (!callback) {
				throw err
			}

			callback(err)
		}
	}

	length(callback: (err: any, length: number) => void) {
		try {
			return this.db(this.table)
				.count('id as count')
				.first()
				.then((row: any) => {
					const count = Number.parseInt(row.count) || 0

					if (!callback) {
						return count
					}

					return callback(null, count)
				})
				.catch((err: any) => {
					if (callback) {
						return callback(err, 0)
					}

					throw err
				})
		} catch (err) {
			if (!callback) {
				throw err
			}

			callback(err, 0)
		}
	}

	clear(callback?: (err?: any) => void) {
		try {
			return this.db(this.table)
				.delete()
				.then((count: any) => {
					count = Number.parseInt(count) || 0

					if (!callback) {
						return count
					}

					return callback(null)
				})
				.catch((err: any) => {
					if (callback) {
						return callback(err)
					}

					throw err
				})
		} catch (err) {
			if (!callback) {
				throw err
			}

			callback(err)
		}
	}

	clearExpiredSessions(callback?: (err?: any, count?: number) => void) {
		try {
			return this.db(this.table)
				.where('expires_at', '<', new Date())
				.delete()
				.then((count: any) => {
					count = Number.parseInt(count) || 0

					if (!callback) {
						return count
					}

					return callback(null, count)
				})
				.catch((err: any) => {
					if (callback) {
						return callback(err)
					}

					throw err
				})
		} catch (err) {
			if (!callback) {
				throw err
			}

			callback(err)
		}
	}

	setExpirationInterval(interval?: number) {
		interval || (interval = this.options.checkExpirationInterval)

		this.clearExpirationInterval()
		this._expirationInterval = setInterval(this.clearExpiredSessions.bind(this), interval)
	}

	clearExpirationInterval() {
		clearInterval(this._expirationInterval!)
		this._expirationInterval = null
	}

	close(callback?: (err?: any) => void) {
		this.clearExpirationInterval()

		if (!callback) {
			return
		}

		return callback(null)
	}
}
