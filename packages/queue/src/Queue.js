import './Job'

import Kue from 'kue'

export class Queue {
	kue = null
	app = null
	jobs = { }

	constructor(app, config) {
		if(config.isNil) {
			config = app.config.get('queue.default')
		}

		if(typeof config === 'string') {
			config = app.config.get(`queue.connections.${config}`)

			if(config.isNil) {
				throw new Error('Invalid config')
			}
		}

		this.app = app
		this.kue = Kue.createQueue(config)
	}

	register(jobClass) {
		if(jobClass.jobName.isNil) {
			throw new Error('Invalid Job, must have jobName set.')
		} else if(!(jobClass.prototype instanceof Job)) {
			throw new Error('All job classes must inherit from Job')
		}

		this.jobs[jobClass.jobName] = jobClass
	}

	findJobs(job) {
		if(typeof job === 'string') {
			job = this.jobs[job]
		}

		if(job.isNil || !(job.prototype instanceof Job)) {
			throw new Error('Invalid Job')
		}
	}

	dispatch(job) {
		return job.$save(this)
	}

	process() {
		return Promise.all(Object.keys(this.jobs).map(
			key => this._process(this.jobs[key])
		))
	}

	_process(jobClass) {
		return new Promise(resolve => {
			this.kue.process(jobClass.jobName, async (kueJob, ctx, done) => {
				let result = null

				try {
					const job = new jobClass(kueJob.data, kueJob)
					result = job.$handle(this.app, this)
				} catch(err) {
					return done(err)
				}

				if(result.isNil || typeof result.then !== 'function') {
					return done()
				}

				result.then(() => done()).catch(err => done(err))
			})

			resolve()
		})
	}

}
