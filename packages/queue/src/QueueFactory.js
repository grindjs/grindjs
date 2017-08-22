import './Job'
import './Queue'

import './Drivers/BaseDriver'
import './Drivers/BeanstalkDriver'
import './Drivers/RabbitDriver'

export class QueueFactory {
	app = null
	connections = { }
	jobs = { }
	drivers = {
		beanstalk: BeanstalkDriver,
		beanstalkd: BeanstalkDriver,
		rabbit: RabbitDriver,
		rabbitmq: RabbitDriver,
		amqp: RabbitDriver
	}

	constructor(app) {
		this.app = app
	}

	dispatch(job, connection = null) {
		return this.get(connection).dispatch(job)
	}

	status(job, connection = null) {
		return this.get(connection).status(job)
	}

	get(connection) {
		let name = null

		if(connection.isNil) {
			connection = this.app.config.get('queue.default')
		}

		if(typeof connection === 'string') {
			const q = this.connections[connection]

			if(!q.isNil) {
				return q
			}

			name = connection
			connection = this.app.config.get(`queue.connections.${name}`)
		}

		if(connection.isNil || typeof connection !== 'object') {
			throw new Error('Invalid config')
		}

		const config = { ...connection }
		const driverClass = this.drivers[config.driver]

		if(driverClass.isNil) {
			throw new Error(`Unsupported queue driver: ${config.driver}`)
		}

		connection = this.make(driverClass, config)

		if(!name.isNil) {
			this.connections[name] = connection
		}

		return connection
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
		return Promise.all(Object.values(this.connections).map(connection => connection.destroy()))
	}

}
