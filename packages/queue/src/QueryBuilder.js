import { Job as KueJob } from 'kue'

export class QueryBuilder {
	jobClass = null
	queue = null

	_state = null
	_limit = null
	_offset = null
	_forJob = null
	_orderBy = 'asc'

	constructor(queue) {
		this.queue = queue
	}

	for(forJob) {
		this._forJob = forJob
		return this
	}

	state(state) {
		this._state = state
		return this
	}

	limit(limit) {
		this._limit = limit
		return this
	}

	offset(offset) {
		this._offset = offset
		return this
	}

	subset(limit, offset = 0) {
		if(typeof limit === 'object') {
			offset = limit.offset || 0
			limit = limit.limit
		}

		return this.limit(limit).offset(offset)
	}

	orderBy(orderBy) {
		this._orderBy = orderBy
		return this
	}

	then(...args) {
		return this._build().then(...args)
	}

	catch(...args) {
		return this._build().catch(...args)
	}

	first() {
		return this.limit(1).then(jobs => jobs[0])
	}

	_build() {
		if(!this._forJob.isNil && this._state.isNil) {
			throw new Error('Queries that use `for` currently require a state')
		}

		let from = 0
		let to = -1

		if(!this._offset.isNil) {
			from = this._offset
		}

		if(!this._limit.isNil) {
			to = from + this._limit
		}

		// TODO: This is not currently safe for multiple queues
		// Kue internally calls `redis` directly instead of using
		// the Queue instances redis.

		return new Promise((resolve, reject) => {
			const callback = (err, kueJobs) => {
				if(!err.isNil) {
					return reject(err)
				}

				const jobs = [ ]

				for(const kueJob of kueJobs) {
					const jobClass = this.queue.jobs[kueJob.type]

					if(jobClass.isNil) {
						Log.error(`Skipping unknown job: ${kueJob.type}`)
						continue
					}

					jobs.push(new jobClass(kueJob.data, kueJob))
				}

				resolve(jobs)
			}

			if(!this._forJob.isNil) {
				KueJob.rangeByType(this._forJob.jobName, this._state, from, to, this._orderBy, callback)
			} else if(this._state.isNil) {
				KueJob.rangeByState(this._state, from, to, this._orderBy, callback)
			} else {
				KueJob.range(from, to, this._orderBy, callback)
			}
		})
	}

}
