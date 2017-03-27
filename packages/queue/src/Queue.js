import './Job'
import './ConfigBuilder'
import './QueryBuilder'

import Kue from 'kue'

export class Queue {
	kue = null
	app = null
	jobs = { }

	constructor(app, config) {
		this.app = app
		this.kue = new Kue(ConfigBuilder(config, app))
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

	query() {
		return new QueryBuilder(this)
	}

	fetchJob(id) {
		return new Promise((resolve, reject) => {
			Kue.Job.get(id, (err, job) => {
				if(!err.isNil) {
					return reject(err)
				}

				const jobClass = this.jobs[job.type]

				if(jobClass.isNil) {
					return reject(new Error(`Unable to fetch job of unknown type: ${job.type}`))
				}

				resolve(new jobClass(job.data, job))
			})
		})
	}

	dispatch(job) {
		return job.$save(this)
	}

	process(jobNames) {
		let jobs = Object.keys(this.jobs)

		if(!jobNames.isNil && jobs.length > 0) {
			jobs = jobs.filter(name => jobNames.indexOf(name) >= 0)
		}

		return Promise.all(jobs.map(
			key => this._process(this.jobs[key])
		))
	}

	_process(jobClass) {
		return new Promise(() => {
			this.kue.process(jobClass.jobName, jobClass.concurrency, async (kueJob, ctx, done) => {
				let result = null

				try {
					const job = new jobClass(kueJob.data, kueJob)
					result = job.$handle(this.app, this)
				} catch(err) {
					return this.handleError(err, done)
				}

				if(result.isNil || typeof result.then !== 'function') {
					return done()
				}

				result.then(() => done()).catch(err => this.handleError(err, done))
			})
		})
	}

	handleError(error, done) {
		return done(error)
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
