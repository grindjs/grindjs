import './BaseDriver'
import '../Support/Beanstalk'

/**
 * Beanstalkd backed Queue Driver
 */
export class BeanstalkDriver extends BaseDriver {

	client = null

	constructor(app, config) {
		super(app, config)

		this.client = new Beanstalk(config.connection.host, config.connection.port)
	}

	connect() {
		return this.client.connect()
	}

	async dispatch(job) {
		const payload = this.buildPayload(job)
		payload.delay = Math.round(payload.delay / 1000)
		payload.timeout = Math.round(payload.timeout / 1000)
		payload.retry_delay = Math.round(payload.retry_delay / 1000)

		await this.client.use(payload.queue)

		// FIXME: There’s an edge case here where use can change from a different
		// dispatched job and this job will get placed in the wrong queue.
		return this.client.put(0, payload.delay, 0, 'grind-job', payload)
	}

	listen(queues, concurrency, jobHandler, errorHandler) {
		const listeners = [ ]

		for(let i = 0; i < concurrency; i++) {
			listeners.push(this._listen(queues, jobHandler, errorHandler))
		}

		return Promise.all(listeners)
	}

	_listen(queues, jobHandler, errorHandler) {
		return this.client.watch(queues, 'grind-job', (job, jobId, callback) => {
			jobHandler(job).then(() => callback('success')).catch(err => {
				const tries = Number.parseInt(job.tries) || 1

				if(tries <= 1) {
					throw err
				}

				return this.client.statsJob(jobId).then(stats => {
					if(job.timeout > 0 && stats.age >= job.timeout) {
						throw err
					}

					if(stats.reserves >= tries) {
						throw err
					}

					if(job.retry_delay <= 0) {
						delete job.retry_delay
					}

					callback('release', job.retry_delay)
				})
			}).catch(err => {
				errorHandler(job, err)
				callback('success')
			})
		})
	}

	destroy() {
		return this.client.end()
	}

}
