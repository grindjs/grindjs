/**
 * Base class all drivers must extend
 */
export class BaseDriver {
	app = null

	constructor(app) {
		this.app = app
	}

	/**
	 * Dispatches a job
	 *
	 * @param  Job job Job to dispatch
	 * @return Promise    Promise that resolves to the dispatched job id
	 */
	dispatch(/* job */) {
		return Promise.reject('Abstract method, subclasses must implement.')
	}

	/**
	 * Listens for jobs dispatched to the queue
	 *
	 * @param  string   name    Name of the queue to listen on
	 * @param  function handler Callback hander to process the job
	 *
	 * @return Promise          Promise that resolves once the
	 *                          queue is exhausted, or never resolves
	 *                          if the queue listens forever
	 */
	listen(/* name, handler */) {
		return Promise.reject('Abstract method, subclasses must implement.')
	}

	/**
	 * Checks the status of a job
	 *
	 * @param  mixed jobId     ID of a job previously dispatched on the queue
	 * @return Promise<string> Status of the job
	 */
	status(/* jobId */) {
		return Promise.reject('Abstract method, subclasses must implement.')
	}

	/**
	 * Builds the payload for a job
	 *
	 * @param  Job job Instance of a job to create a payload for
	 * @return object  Raw object that can be serialized and stored
	 */
	buildPayload(job) {
		return {
			data: job.$toJson(),
			name: job.constructor.jobName
		}
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
