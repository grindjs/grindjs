import { MissingPackageError } from 'grind-framework'

let FivebeansClient = null
let FivebeansWorker = null

/**
 * Loads the fivebeans package or throws an error
 * if it hasn‘t been added
 */
function loadPackage() {
	if(!FivebeansClient.isNil) {
		return
	}

	try {
		const Fivebeans = require('fivebeans')
		FivebeansClient = Fivebeans.client
		FivebeansWorker = Fivebeans.worker
	} catch(err) {
		throw new MissingPackageError('fivebeans')
	}
}

/**
 * Wrapper around Fivebeans to provide a
 * promise based interface + simplifies a few ops
 */
export class Beanstalk {

	constructor(...config) {
		loadPackage()

		this.client = new FivebeansClient(...config)
	}

	connect() {
		return new Promise((resolve, reject) => {
			this.client.on('connect', () => {
				resolve()
			})

			this.client.on('error', err => {
				reject(err)
			})

			this.client.connect()
		})
	}

	use(tube) {
		return new Promise((resolve, reject) => {
			this.client.use(tube, err => {
				if(!err.isNil) {
					return reject(err)
				}

				return resolve()
			})
		})
	}

	put(priority, delay, ttr, type, payload) {
		return new Promise((resolve, reject) => {
			this.client.put(priority, delay, ttr, JSON.stringify({
				type: type,
				payload: JSON.stringify(payload)
			}), (err, jobId) => {
				if(!err.isNil) {
					return reject(err)
				}

				return resolve(jobId)
			})
		})
	}

	statsJob(jobId) {
		return new Promise((resolve, reject) => {
			this.client.stats_job(jobId, (err, stats) => {
				if(!err.isNil) {
					return reject(err)
				}

				return resolve(stats)
			})
		})
	}

	watch(tube, types, handler) {
		let worker = null
		const handlers = { }

		if(typeof types === 'string') {
			types = [ types ]
		}

		const _handler = {
			work: (payload, callback) => {
				handler(JSON.parse(payload), worker.currentJob, callback)
			}
		}

		for(const type of types) {
			handlers[type] = _handler
		}

		worker = new FivebeansWorker({ handlers })

		// fivebeans’s worker class creates it’s
		// own client, since we already have one
		// we’ll assign it and dupe some logic
		// to be able to share a client

		worker.client = this.client
		worker.on('next', () => worker.doNext())

		worker.on('info', message => {
			Log.info('beanstalk.info', message)
		})

		worker.on('warning', message => {
			Log.warn('beanstalk.warning', message)
		})

		return new Promise((resolve, reject) => {
			worker.watch([ tube ], err => {
				if(!err.isNil) {
					return reject(err)
				}

				if(tube !== 'default') {
					worker.ignore([ 'default' ], err => {
						if(!err.isNil) {
							return reject(err)
						}

						worker.emit('started')
						worker.emit('next')
					})
				} else {
					worker.emit('started')
					worker.emit('next')
				}
			})
		})
	}

	end() {
		try {
			this.client.end()
		} catch(err) {
			return Promise.reject(err)
		}

		return Promise.resolve()
	}

}
