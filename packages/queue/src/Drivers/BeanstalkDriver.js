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
		const payload = this.buildPayload(job)
		payload.delay = Math.round(payload.delay / 1000)
		payload.timeout = Math.round(payload.timeout / 1000)
		payload.retryDelay = Math.round(payload.delay / 1000)

		await this.client.use(this.tube)

		return this.client.put(payload.priority, payload.delay, 0, payload.name, payload)
	}

	listen(name, handler) {
		return this.client.watch(this.tube, name, (job, jobId, callback) => {
			handler(job).then(() => callback('success')).catch(err => {
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
