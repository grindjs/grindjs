const EventEmitter = require('events')

export class Queue {

	driver = null
	app = null
	factory = null
	_connectEmitter = null

	constructor(app, factory, driver) {
		this.app = app
		this.factory = factory
		this.driver = driver
	}

	connect() {
		if(this.driver.state === 'connected') {
			return Promise.resolve()
		} else if(this.driver.state === 'connecting') {
			return new Promise((resolve, reject) => {
				this._connectEmitter.once('connected', resolve)
				this._connectEmitter.once('failed', reject)
			})
		}

		this.driver.state = 'connecting'
		this._connectEmitter = new EventEmitter
		this._connectEmitter.on('error', err => Log.error('_connectEmitter error', err))

		return this.driver.connect().catch(err => {
			this.driver.state = 'error'
			this._connectEmitter.emit('failed', err)
			throw err
		}).then(() => {
			this.driver.state = 'connected'
			this._connectEmitter.emit('connected')
		})
	}

	dispatch(job) {
		return this.connect().then(() => this.driver.dispatch(job))
	}

	willListen() {
		return this.driver.willListen()
	}

	listen(queues, concurrency) {
		if(typeof queues === 'string') {
			queues = [ queues ]
		} else if(queues.isNil) {
			queues = [ this.driver.queue ]
		}

		return this.connect().then(() => this.driver.listen(queues, concurrency, payload => {
			let result = null

			try {
				const jobClass = this.factory.jobs[payload.name]

				if(jobClass.isNil) {
					throw new Error('Invalid job name', payload.name)
				}

				result = jobClass.fromJson(payload.data).$handle(this.app, this)
			} catch(err) {
				try {
					return this.handleError(err)
				} catch(err2) {
					Log.error('Error handling error', err2)
					return Promise.reject(err)
				}
			}

			if(result.isNil || typeof result.then !== 'function') {
				return Promise.resolve()
			}

			return result.catch(err => this.handleError(err))
		}, this.logError.bind(this)))
	}

	status(jobId) {
		return this.driver.status(jobId)
	}

	handleError(err) {
		return this.driver.handleError(err)
	}

	logError(payload, err) {
		Log.error(`Job failed: ${payload.name}`, err)
	}

	destroy() {
		return this.driver.destroy().then(() => {
			this.driver.state = 'destroyed'
		})
	}

}
