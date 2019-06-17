const EventEmitter = require('events')
const uuid = require('uuid/v4')

import './Job'

export class Queue {

	app
	factory
	driver
	stateful
	_connectEmitter = null

	constructor(app, factory, driver, stateful) {
		this.app = app
		this.factory = factory
		this.driver = driver
		this.stateful = stateful
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

		let id = null

		if(this.stateful) {
			id = uuid()
		}

		await this.driver.dispatch(job, id)
		await this.updateJobState(job, 'waiting')

		return id
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

				const job = jobClass.fromJson(payload.data)
				job.$id = payload.id

				return job
			},

			execute: async job => {
				try {
					await this.updateJobState(job, 'running')
					await job.$handle(this.app, this)

					try {
						await job.$success(this.app, this)
					} catch(err) {
						Log.error(`${job.constructor.name} error when calling success: ${err.message}`, err)
					}

					try {
						await job.$finally(this.app, this)
					} catch(err) {
						Log.error(`${job.constructor.name} error when calling finally: ${err.message}`, err)
					}

					await this.updateJobState(job, 'done', {
						result: job.$result
					})
				} catch(err) {
					await this.updateJobState(job, 'waiting')

					try {
						return await this.handleError(err)
					} catch(err2) {
						Log.error('Error handling error', err2)
						throw err
					}
				}
			},

			handleError: async (job, payload, err) => {
				await this.updateJobState(job, 'failed', {
					result: job.$result
				})

				try {
					await job.$fatal(this.app, this, err)
				} catch(err) {
					Log.error(`${job.constructor.name} error when calling fatal: ${err.message}`, err)
				}

				try {
					await job.$finally(this.app, this)
				} catch(err) {
					Log.error(`${job.constructor.name} error when calling finally: ${err.message}`, err)
				}

				return this.logError(payload, err)
			}
		})
	}

	status(jobId) {
		if(!this.stateful) {
			throw new Error('`grind-queue` is not configured to be stateful')
		}

		return this.app.cache.get(Job.stateKey(jobId)).then(result => {
			if(result.isNil) {
				return { state: 'missing' }
			}

			return result
		})
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

	async updateJobState(job, state, context = { }) {
		try {
			await job.$updateState(this.app, state, context)
		} catch(err) {
			Log.error(`${job.constructor.name} stateful update error`, err)
		}
	}

}
