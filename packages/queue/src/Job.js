import { Job as KueJob } from 'kue'

export class Job {
	static jobName = null
	static priority = 'normal'
	static removeOnComplete = true
	static attempts = 1
	static backoff = null
	static concurrency = 1

	$kueJob = null
	$queue = null

	constructor(data = { }, $kueJob = null) {
		Object.assign(this, data)
		this.$kueJob = $kueJob || (() => {
			const job = new KueJob
			job.attempts(this.constructor.attempts)
			job.priority(this.constructor.priority)
			job.removeOnComplete(this.constructor.removeOnComplete)
			job.backoff(this.constructor.backoff)
			job.events(false)
			return job
		})()
	}

	get id() {
		return this.$kueJob.id
	}

	// eslint-disable-next-line no-unused-vars
	$handle(app, queue) {
		//
	}

	$priority(...args) {
		this.$kueJob.priority(...args)
		return this
	}

	$delay(...args) {
		this.$kueJob.delay(...args)
		return this
	}

	$attempts(...args) {
		this.$kueJob.attempts(...args)
		return this
	}

	$backoff(...args) {
		this.$kueJob.backoff(...args)
		return this
	}

	$ttl(...args) {
		this.$kueJob.ttl(...args)
		return this
	}

	$progress(...args) {
		this.$kueJob.progress(...args)
		return this
	}

	$log(...args) {
		this.$kueJob.log(...args)
		return this
	}

	$save(queue) {
		if(this.id.isNil) {
			if(queue.isNil) {
				throw new Error('Calling $save on new jobs requires a queue parameter.')
			}

			const jobName = this.constructor.jobName

			if(jobName.isNil) {
				throw new Error('Invalid Job, must have `jobName` set.')
			}

			if(queue.jobs[jobName].isNil) {
				throw new Error('This job is not yet registered with the target queue.')
			}

			this.$kueJob.type = jobName
			this.$kueJob.client = queue.kue.client
		}

		this.$kueJob.data = this.toJSON()

		return new Promise((resolve, reject) => {
			let resolved = false

			this.$kueJob.save(err => {
				if(resolved) {
					return
				}

				resolved = true

				if(!err.isNil) {
					return reject(err)
				}

				resolved = true
				return resolve(this)
			})
		})
	}

	toJSON() {
		return this.$toJson()
	}

	$toJson() {
		const json = Object.assign({ }, this)

		for(const key of Object.keys(json)) {
			if(key.substring(0, 1) !== '$') {
				continue
			}

			delete json[key]
		}

		return json
	}

}
