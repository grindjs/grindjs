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

	async connect() {
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

		try {
			await this.driver.connect()
		} catch(err) {
			this.driver.state = 'error'
			this._connectEmitter.emit('failed', err)
			throw err
		}

		this.driver.state = 'connected'
		this._connectEmitter.emit('connected')
	}

	async dispatch(job) {
		await this.connect()

		return this.driver.dispatch(job)
	}

	willListen() {
		return this.driver.willListen()
	}

	async listen(queues, concurrency) {
		if(typeof queues === 'string') {
			queues = [ queues ]
		} else if(queues.isNil) {
			queues = [ this.driver.queue ]
		}

		await this.connect()

		return this.driver.listen(queues, concurrency, {
			makeJob: payload => {
				const jobClass = this.factory.jobs[payload.name]

				if(jobClass.isNil) {
					throw new Error('Invalid job name', payload.name)
				}

				return jobClass.fromJson(payload.data)
			},

			execute: async job => {
				try {
					return await job.$handle(this.app, this)
				} catch(err) {
					try {
						return await this.handleError(err)
					} catch(err2) {
						Log.error('Error handling error', err2)
						throw err
					}
				}
			},

			handleError: this.logError.bind(this)
		})
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

	async destroy() {
		await this.driver.destroy()

		this.driver.state = 'destroyed'
	}

}
