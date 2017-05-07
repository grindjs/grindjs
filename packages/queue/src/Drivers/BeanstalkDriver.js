import './BaseDriver'
import '../Support/Beanstalk'

/**
 * Beanstalkd backed Queue Driver
 */
export class BeanstalkDriver extends BaseDriver {
	client = null
	tube = null

	constructor(app, config) {
		super(app, config)

		this.client = new Beanstalk(config.host, config.port)
		this.tube = config.queue || 'default'
	}

	connect() {
		return this.client.connect()
	}

	async dispatch(job) {
		const options = job.$options
		const defaults = job.constructor
		const payload = this.buildPayload(job)

		const priority = this.resolvePriority(options.priority || defaults.priority)
		const delay = Math.round((options.delay || 0) / 1000)
		const timeout = Math.round((options.timeout || 0) / 1000)
		const tries = Math.max(1, Number.parseInt(options.tries || defaults.tries) || 1)
		const retryDelay = Math.round((
			options.retryDelay || defaults.retryDelay || this.retryDelay || options.delay || 0
		) / 1000)

		await this.client.use(this.tube)

		return this.client.put(priority, delay, 0, payload.name, {
			tries: tries || 1,
			timeout: timeout,
			retryDelay: retryDelay,
			payload: payload
		})
	}

	listen(name, handler) {
		return this.client.watch(this.tube, name, (job, jobId, callback) => {
			handler(job.payload).then(() => callback('success')).catch(err => {
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

					if(job.retryDelay <= 0) {
						delete job.retryDelay
					}

					callback('release', job.retryDelay)
				})
			}).catch(err => {
				Log.error('Erroring running job, deleting', err)
				callback('success')
			})
		})
	}

	destroy() {
		return this.client.end()
	}

}
