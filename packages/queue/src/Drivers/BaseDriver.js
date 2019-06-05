/**
 * Base class all drivers must extend
 */
export class BaseDriver {

	app = null
	state = null
	retryDelay = 90000
	queue = null

	constructor(app, config) {
		this.app = app
		this.queue = config.queue || 'default'

		if(config.retry_delay) {
			this.retryDelay = Number.parseInt(config.retry_delay)
		}
	}

	/**
	 * Connects to the backend engine
	 *
	 * @return Promise Promise that resolves when connected
	 */
	connect() {
		return Promise.reject(new Error('Abstract method, subclasses must implement.'))
	}

	/**
	 * Dispatches a job
	 *
	 * @param  Job job Job to dispatch
	 * @return Promise    Promise that resolves to the dispatched job id
	 */
	dispatch(/* job */) {
		return Promise.reject(new Error('Abstract method, subclasses must implement.'))
	}

	/**
	 * Called before `listen` is called to allow the driver
	 * to do any prep work before listening starts.
	 *
	 * @return Promise
	 */
	willListen() {
		return Promise.resolve()
	}

	/**
	 * Listens for jobs dispatched to the specified queues
	 *
	 * @param  [string] queues       Name of the queues listen for
	 * @param  number   concurrency  Number of jobs to process at once
	 * @param  function jobHandler   Job handler to process the job
	 * @param  function errorHandler Error handler for unrecoverable errors
	 * @return Promise               Promise that resolves once the
	 *                               queue is exhausted, or never resolves
	 *                               if the queue listens forever
	 */
	listen(/* queues, concurrency, jobHandler, errorHandler */) {
		return Promise.reject(new Error('Abstract method, subclasses must implement.'))
	}

	/**
	 * Checks the status of a job
	 *
	 * @param  mixed jobId     ID of a job previously dispatched on the queue
	 * @return Promise<string> Status of the job
	 */
	status(/* jobId */) {
		return Promise.reject(new Error('Abstract method, subclasses must implement.'))
	}

	/**
	 * Builds the payload for a job
	 *
	 * @param  Job job Instance of a job to create a payload for
	 * @return object  Raw object that can be serialized and stored
	 */
	buildPayload(job) {
		const options = job.$options
		const defaults = job.constructor

		return {
			name: job.constructor.jobName,
			data: job.$toJson(),
			queue: options.queue || defaults.queue || this.queue,
			delay: options.delay || defaults.delay || 0,
			timeout: options.timeout || defaults.timeout || 0,
			tries: Math.max(1, Number.parseInt(options.tries || defaults.tries) || 1),
			retry_delay: options.retryDelay || defaults.retryDelay || this.retryDelay || options.delay || 0
		}
	}

	/**
	 * Handle execution and errors for a payload
	 *
	 * @param  Object context Context to execute payload in
	 * @param  Object payload Payload to execute
	 * @return Promise
	 */
	async receivePayload(context, payload) {
		const job = await context.makeJob(payload)

		try {
			await context.execute(job)

			try {
				await this.success(context, job, payload)
			} catch(err) {
				Log.error(`${this.constructor.name} error when calling success: ${err.message}`, err)
			}
		} catch(err) {
			try {
				await this.retryOrRethrow(context, payload, err)
			} catch(err2) {
				try {
					await this.fatal(context, job, payload, err)
				} catch(err3) {
					Log.error(`${this.constructor.name} error when calling fatal: ${err.message}`, err)
				}

				await context.handleError(job, payload, err)
			}
		}
	}

	/**
	 * Retries the payload if possible, otherwises rethrows the error
	 *
	 * @param  Object context Context to execute payload in
	 * @param  Object payload Payload for the job
	 * @param  Job job Instantiated job class for the payload
	 * @param  Error error Error while evaluating the payload
	 * @return Promise
	 */
	retryOrRethrow(context, payload, job, error) {
		const tries = Number(payload.tries) || 1

		if(tries <= 1) {
			throw error
		}

		const tryCount = Number(payload.try) || 1

		if(tryCount >= tries) {
			throw error
		}

		const timeout = Number(payload.timeout) || 0

		if(timeout > 0) {
			const at = Number(payload.at) || 0

			if(at > 0 && (Date.now() + timeout) > at) {
				throw error
			}
		}

		const delay = payload.retry_delay || payload.delay
		const at = delay.isNil ? null : (new Date(Date.now() + delay))
		payload.try = tryCount + 1

		return this.retry(context, payload, job, at)
	}

	/**
	 * Handle success for the payload
	 *
	 * @param  Object context Context to execute payload in
	 * @param  Object payload Payload for the job
	 * @param  Job job Instantiated job class for the payload
	 * @return Promise
	 */
	success(/* context, payload, job */) {
		return Promise.resolve()
	}

	/**
	 * Retry the payload at the specified time
	 *
	 * @param  Object context Context to execute payload in
	 * @param  Object payload Payload for the job
	 * @param  Job job Instantiated job class for the payload
	 * @param  Date at When to retry the job at
	 * @return Promise
	 */
	retry(/* context, payload, job, at */) {
		return Promise.reject(new Error('Abstract method, subclasses must implement.'))
	}

	/**
	 * Handle fatal error for the payload
	 *
	 * @param  Object context Context to execute payload in
	 * @param  Object payload Payload for the job
	 * @param  Job job Instantiated job class for the payload
	 * @param  Error error Error while evaluating the payload
	 * @return Promise
	 */
	fatal(/* context, payload, job, error */) {
		return Promise.resolve()
	}

	/**
	 * Handle an error
	 * Default implementation returns a rejected promise
	 *
	 * @param  Error err
	 * @return Promise
	 */
	handleError(err) {
		return Promise.reject(err)
	}

	/**
	 * Cleanup the connection to the queue
	 * @return Promise
	 */
	destroy() {
		return Promise.resolve()
	}

}
