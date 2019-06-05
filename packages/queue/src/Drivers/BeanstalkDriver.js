import './BaseDriver'
import '../Support/Beanstalk'

/**
 * Beanstalkd backed Queue Driver
 */
export class BeanstalkDriver extends BaseDriver {

	client = null
	listenClient = null

	constructor(app, config) {
		super(app, config)

		this.client = new Beanstalk(config.connection.host, config.connection.port)
		this.listenClient = new Beanstalk(config.connection.host, config.connection.port)
	}

	connect() {
		return this.client.connect()
	}

	async dispatch(job) {
		const payload = this.buildPayload(job)

		await this.client.use(payload.queue)

		// FIXME: There’s an edge case here where use can change from a different
		// dispatched job and this job will get placed in the wrong queue.
		return this.client.put(0, Math.round(payload.delay / 1000), 0, 'grind-job', payload)
	}

	async listen(queues, concurrency, context) {
		await this.listenClient.connect()

		const listeners = [ ]

		for(let i = 0; i < concurrency; i++) {
			listeners.push(this._listen(queues, context))
		}

		return Promise.all(listeners)
	}

	_listen(queues, context) {
		return this.listenClient.watch(queues, 'grind-job', async (job, jobId, callback) => {
			this.receivePayload({
				...context,
				beanstalk: {
					job,
					jobId,
					callback
				}
			}, job)
		})
	}

	success(context) {
		return Promise.resolve(context.beanstalk.callback('success'))
	}

	async retry(context, payload, job, at) {
		await context.beanstalk.callback('success')

		const delay = at.isNil ? 0 : Math.max(0, Math.round(Date.now() - at.getTime()) / 1000)

		await this.client.use(payload.queue)

		// FIXME: There’s an edge case here where use can change from a different
		// dispatched job and this job will get placed in the wrong queue.
		return this.client.put(0, Math.max(1, delay), 0, 'grind-job', payload)
	}

	fatal(context) {
		return Promise.resolve(context.beanstalk.callback('success'))
	}

	destroy() {
		return Promise.all([
			this.client.end(),
			this.listenClient.end()
		])
	}

}
