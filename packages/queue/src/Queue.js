export class Queue {

	driver = null
	app = null
	factory = null

	constructor(app, factory, driver) {
		this.app = app
		this.factory = factory
		this.driver = driver
	}

	dispatch(job) {
		return this.driver.dispatch(job)
	}

	listen(jobClass) {
		if(typeof jobClass === 'string') {
			jobClass = this.factory.jobs[jobClass]
		}

		if(jobClass.isNil) {
			throw new Error('Invalid job')
		}

		return this.driver.listen(jobClass.jobName, payload => {
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
		})
	}

	status(jobId) {
		return this.driver.status(jobId)
	}

	handleError(err) {
		return this.driver.handleError(err)
	}

	destroy() {
		return this.driver.destroy()
	}

}
