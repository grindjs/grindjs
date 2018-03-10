//
// Adapted from express-mysql-session
// https://github.com/chill117/express-mysql-session/blob/03a4cc7/lib/index.js
//

import { Store } from 'express-session'

export class DatabaseStore extends Store {

	db = null
	table = null

	constructor({ app, connection, table, ...options }) {
		super(options)

		if(connection.isNil) {
			this.db = app.db
		} else if(typeof connection === 'string') {
			this.db = require('grind-db').DatabaseBuilder(connection, app)
		} else {
			this.db = connection
		}

		this.table = table || 'sessions'
		this.options = {
			checkExpirationInterval: 900000,
			expiration: 86400000,
			...options
		}

		this.setExpirationInterval()
	}

	get(sessionId, callback) {
		try {
			return this.db(this.table).select('data').where({ id: sessionId }).first().then(row => {
				let session = null

				try {
					session = row.isNil ? null : JSON.parse(row.data)
				} catch(err) {
					const error = new Error(`Failed to parse data for session: ${sessionId}`)

					if(!callback.isNil) {
						return callback(error)
					}

					throw error
				}

				if(!callback.isNil) {
					return callback(null, session)
				}

				return session
			}).catch(err => {
				if(callback.isNil) {
					throw err
				}

				callback(err)
			})
		} catch(err) {
			if(callback.isNil) {
				throw err
			}

			callback(err)
		}
	}

	set(sessionId, data, callback) {
		try {
			let expires = null

			if(data.cookie) {
				if(data.cookie.expires) {
					expires = data.cookie.expires
				} else if(data.cookie._expires) {
					expires = data.cookie._expires
				}
			}

			if(!expires) {
				expires = Date.now() + this.options.expiration
			}

			if(!(expires instanceof Date)) {
				expires = new Date(expires)
			}

			// Use whole seconds here; not milliseconds.
			const row = {
				id: sessionId,
				data: JSON.stringify(data),
				expires_at: expires
			}

			return this.db(this.table).insert(row).catch(() => {
				return this.db(this.table).where({ id: sessionId }).update(row)
			}).then(() => {
				if(!callback.isNil) {
					return callback()
				}
			}).catch(err => {
				if(!callback.isNil) {
					return callback(err)
				}

				throw err
			})
		} catch(err) {
			if(callback.isNil) {
				throw err
			}

			callback(err)
		}
	}

	touch(sessionId, data, callback) {
		try {
			let expires = null

			if(data.cookie) {
				if(data.cookie.expires) {
					expires = data.cookie.expires
				} else if(data.cookie._expires) {
					expires = data.cookie._expires
				}
			}

			if(!expires) {
				expires = Date.now() + this.options.expiration
			}

			if(!(expires instanceof Date)) {
				expires = new Date(expires)
			}

			return this.db(this.table).where({ id: sessionId }).update({ expires_at: expires }).then(() => {
				if(callback.isNil) {
					return
				}

				return callback()
			}).catch(err => {
				if(!callback.isNil) {
					return callback(err)
				}

				throw err
			})
		} catch(err) {
			if(callback.isNil) {
				throw err
			}

			callback(err)
		}
	}

	destroy(sessionId, callback) {
		try {
			return this.db(this.table).where({ id: sessionId }).delete().then(count => {
				count = Number.parseInt(count) || 0

				if(callback.isNil) {
					return count
				}

				return callback(null, count)
			}).catch(err => {
				if(!callback.isNil) {
					return callback(err)
				}

				throw err
			})
		} catch(err) {
			if(callback.isNil) {
				throw err
			}

			callback(err)
		}
	}

	length(callback) {
		try {
			return this.db(this.table).count('id as count').first().then(row => {
				const count = Number.parseInt(row.count) || 0

				if(callback.isNil) {
					return count
				}

				return callback(null, count)
			}).catch(err => {
				if(!callback.isNil) {
					return callback(err)
				}

				throw err
			})
		} catch(err) {
			if(callback.isNil) {
				throw err
			}

			callback(err)
		}
	}

	clear(callback) {
		try {
			return this.db(this.table).delete().then(count => {
				count = Number.parseInt(count) || 0

				if(callback.isNil) {
					return count
				}

				return callback(null, count)
			}).catch(err => {
				if(!callback.isNil) {
					return callback(err)
				}

				throw err
			})
		} catch(err) {
			if(callback.isNil) {
				throw err
			}

			callback(err)
		}
	}

	clearExpiredSessions(callback) {
		try {
			return this.db(this.table).where('expires_at', '<', new Date).delete().then(count => {
				count = Number.parseInt(count) || 0

				if(callback.isNil) {
					return count
				}

				return callback(null, count)
			}).catch(err => {
				if(!callback.isNil) {
					return callback(err)
				}

				throw err
			})
		} catch(err) {
			if(callback.isNil) {
				throw err
			}

			callback(err)
		}
	}

	setExpirationInterval(interval) {
		interval || (interval = this.options.checkExpirationInterval)

		this.clearExpirationInterval()
		this._expirationInterval = setInterval(this.clearExpiredSessions.bind(this), interval)
	}

	clearExpirationInterval() {
		clearInterval(this._expirationInterval)
		this._expirationInterval = null
	}

	close(callback) {
		this.clearExpirationInterval()

		if(callback.isNil) {
			return
		}

		return callback(null)
	}

}
