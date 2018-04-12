const EventEmitter = require('events')

export class BaseConnection extends EventEmitter {

	isConnected = false
	attempts = 0
	attemptsReset = null
	maxReconnectAttempts = null
	reconnectDelayInterval = null
	destroyed = false

	constructor({
		maxReconnectAttempts = 10,
		reconnectDelayInterval = 100
	} = { }) {
		super()

		this.maxReconnectAttempts = maxReconnectAttempts
		this.reconnectDelayInterval = reconnectDelayInterval
		this.setMaxListeners(0)
	}

	connect() {
		this.once('open', (...args) => {
			this.isConnected = true
			this.emit('connection:open', ...args)

			if(!this.attemptsReset.isNil) {
				clearTimeout(this.attemptsReset)
			}

			// Delay resetting attempts for 1s
			// to handle immediate failures
			this.attemptsReset = setTimeout(() => {
				this.attempts = 1
			}, 1000)
		})

		this.once('error', () => this.close())

		this.once('close', (...args) => {
			this.emit('connection:close', ...args)
			return this._reconnect()
		})

		return this.open()
	}

	open() {
		throw new Error('Abstract method, subclasses must implement.')
	}

	close() {
		throw new Error('Abstract method, subclasses must implement.')
	}

	perform(callback) {
		if(this.destroyed) {
			return Promise.reject(new Error(`${this.constructor.name} has already been destroyed.`))
		}

		if(this.isConnected) {
			return Promise.resolve(callback(this))
		}

		return new Promise((resolve, reject) => {
			this.once('connection:fatal', reject)
			this.once('connection:open', () => {
				this.removeListener('connection:fatal', reject)

				try {
					resolve(callback(this))
				} catch(err) {
					reject(err)
				}
			})
		})
	}

	_reconnect() {
		if(this.destroyed) {
			return
		}

		const { name } = this.constructor
		const { attempts, maxReconnectAttempts: max } = this

		if(max > 0 && attempts >= max) {
			Log.error(`${name} reached max reconnection attempts, aborting.`)
			this.emit('connection:fatal', new Error('Unable to reconnect.'))
			return
		}

		this.isConnected = false

		const delay = Math.min(30, (Math.pow(2, attempts) - 1)) * this.reconnectDelayInterval
		Log.info(`${name} interrupted, attempt ${attempts + 1} of ${max} to reconnect after ${delay}ms`)

		if(!this.attemptsReset.isNil) {
			clearTimeout(this.attemptsReset)
			this.attemptsReset = null
		}

		setTimeout(() => {
			this.attempts++
			this.connect()
		}, delay)
	}

	destroy() {
		this.destroyed = true
		this.emit('connection:fatal', new Error('Connection destroyed.'))
		return Promise.resolve(this.close())
	}

}
