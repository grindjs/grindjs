import './BaseDriver'
import { MissingPackageError } from 'grind-framework'

let Kue = null
let KueJob = null

/**
 * Loads the Kue package or throws an error
 * if it hasn‘t been added
 */
function loadPackage() {
	if(!Kue.isNil) {
		return
	}

	try {
		Kue = require('kue')
	} catch(err) {
		throw new MissingPackageError('kue')
	}

	KueJob = Kue.Job
}

/**
 * Kue backed Queue Driver
 */
export class KueDriver extends BaseDriver {
	kue = null

	constructor(app, config) {
		super(app, config)

		loadPackage()
		this.kue = new Kue(buildConfig(config, app), app)
	}

	connect() {
		// TODO
		return Promise.resolve()
	}

	dispatch(job) {
		const options = job.$options
		const defaults = job.constructor
		const payload = this.buildPayload(job)

		const kueJob = new KueJob
		kueJob.data = payload
		kueJob.type = payload.name
		kueJob.client = this.kue.client

		kueJob.attempts(options.tries || defaults.tries)
		kueJob.priority(this.resolvePriority(options.priority || defaults.priority))
		kueJob.backoff(options.retryDelay || defaults.retryDelay || this.retryDelay)
		kueJob.removeOnComplete(true)
		kueJob.events(false)

		if(!options.delay.isNil) {
			kueJob.delay(options.delay)
		}

		if(!options.timeout.isNil) {
			kueJob.ttl(options.timeout)
		}

		return new Promise((resolve, reject) => {
			let resolved = false

			kueJob.save(err => {
				if(resolved) {
					// Kue seems to occassionally
					// fire the callback multiple times
					return
				}

				resolved = true

				if(!err.isNil) {
					return reject(err)
				}

				return resolve(job.id)
			})
		})
	}

	willListen() {
		this.client.watchStuckJobs()
		this.client.on('error', err => {
			Log.error('Error', err)
		})

		return Promise.resolve()
	}

	listen(name, handler) {
		return new Promise(() => {
			this.kue.process(name, (job, ctx, done) => {
				handler(job.data).then(() => done).catch(err => done(err))
			})
		})
	}

	destroy() {
		return new Promise((resolve, reject) => {
			this.kue.shutdown(5000, err => {
				if(!err.isNil) {
					return reject(err)
				}

				resolve()
			})
		})
	}

}

/**
 * Builds the config object
 *
 * @param  object config Config object to mutate
 * @param  object app    Instance of Grind
 */
function buildConfig(config, app) {
	if(config.connection === null) {
		config.connection = app.config.get('redis.default')

		if(config.connection.isNil) {
			throw new Error('Invalid config')
		}
	}

	if(typeof config.connection === 'string') {
		config.connection = app.config.get(`redis.connections.${config.connection}`)

		if(config.connection.isNil) {
			throw new Error('Invalid config')
		}
	}

	if(!config.connection.isNil && typeof config.connection === 'object') {
		config.redis = { ...config.connection }

		if(!config.redis.password.isNil) {
			config.redis.auth = config.redis.password
			delete config.redis.password
		}
	}

	delete config.connection

	if(config.redis.isNil || typeof config.redis !== 'object') {
		throw new Error('Invalid config')
	}

	if(config.redis.host === void 0) {
		config.redis.host = 'localhost'
	}

	if(config.redis.port === void 0) {
		config.redis.port = 6379
	}
}
