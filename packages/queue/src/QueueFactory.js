import './Job'
import './Queue'

import './Drivers/BaseDriver'
import './Drivers/BeanstalkDriver'
import './Drivers/KueDriver'

export class QueueFactory {
	app = null
	queues = { }
	jobs = { }
	drivers = {
		beanstalk: BeanstalkDriver,
		beanstalkd: BeanstalkDriver,
		kue: KueDriver
	}

	constructor(app) {
		this.app = app
	}

	dispatch(job, queue = null) {
		return this.get(queue).dispatch(job)
	}

	status(job, queue = null) {
		return this.get(queue).status(job)
	}

	get(queue) {
		let name = null

		if(queue.isNil) {
			queue = this.app.config.get('queue.default')
		}

		if(typeof queue === 'string') {
			const q = this.queues[queue]

			if(!q.isNil) {
				return q
			}

			name = queue
			queue = this.app.config.get(`queue.connections.${name}`)
		}

		if(queue.isNil || typeof queue !== 'object') {
			throw new Error('Invalid config')
		}

		const config = { ...queue }
		const driverClass = this.drivers[config.driver]

		if(driverClass.isNil) {
			throw new Error(`Unsupported queue driver: ${config.driver}`)
		}

		queue = this.make(driverClass, config)

		if(!name.isNil) {
			this.queues[name] = queue
		}

		return queue
	}

	make(driverClass, config) {
		return new Queue(this.app, this, new driverClass(this.app, config))
	}

	registerDriver(name, driverClass) {
		if(!(driverClass.prototype instanceof BaseDriver)) {
			throw new Error('All queue driver classes must inherit from BaseDriver')
		}

		this.drivers[name] = driverClass
	}

	register(jobClass) {
		if(!(jobClass.prototype instanceof Job)) {
			throw new Error('All job classes must inherit from Job')
		} else if(jobClass.jobName.isNil) {
			throw new Error('Invalid Job, must have jobName set.')
		}

		this.jobs[jobClass.jobName] = jobClass
	}

	destroy() {
		return Promise.all(Object.values(this.queues).map(queue => queue.destroy()))
	}

}
