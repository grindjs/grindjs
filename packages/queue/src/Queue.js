export class Queue {

	driver = null
	app = null
	factory = null
	_connectQueue = null

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
				this._connectQueue.push(err => {
					if(!err.isNil) {
						return reject(err)
					}

					return resolve()
				})
			})
		}

		this._connectQueue = [ ]
		this.driver.state = 'connecting'

		return this.driver.connect().catch(err => {
			const queue = this._connectQueue
			this._connectQueue = null
			this.driver.state = 'error'

			for(const handler of queue) {
				handler(err)
			}
		}).then(() => {
			const queue = this._connectQueue
			this._connectQueue = null
			this.driver.state = 'connected'

			for(const handler of queue) {
				handler()
			}
		})
	}

	dispatch(job) {
		return this.connect().then(() => this.driver.dispatch(job))
	}

	willListen() {
		return this.driver.willListen()
	}

	listen(jobClass) {
		if(typeof jobClass === 'string') {
			jobClass = this.factory.jobs[jobClass]
		}

		if(jobClass.isNil) {
			throw new Error('Invalid job')
		}

		return this.connect().then(() => this.driver.listen(jobClass.jobName, payload => {
			let result = null

			try {
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
		}))
	}

	status(jobId) {
		return this.driver.status(jobId)
	}

	handleError(err) {
		return this.driver.handleError(err)
	}

	destroy() {
		return this.driver.destroy().then(() => {
			this.driver.state = 'destroyed'
		})
	}

}
