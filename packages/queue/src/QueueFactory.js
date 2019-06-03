import './Job'
import './Queue'

import './Drivers/BaseDriver'
import './Drivers/BeanstalkDriver'
import './Drivers/FaktoryDriver'
import './Drivers/RabbitDriver'
import './Drivers/RedisDriver'

export class QueueFactory {

	app
	queueClass
	connections = { }
	jobs = { }
	drivers = {
		beanstalk: BeanstalkDriver,
		beanstalkd: BeanstalkDriver,
		faktory: FaktoryDriver,
		rabbit: RabbitDriver,
		rabbitmq: RabbitDriver,
		redis: RedisDriver,
		amqp: RabbitDriver
	}

	constructor(app, { queueClass } = { }) {
		this.app = app
		this.queueClass = queueClass || Queue
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

		config.connection = config.connection || { }
		connection = this.make(driverClass, config)

		if(!name.isNil) {
			this.connections[name] = connection
		}

		return connection
	}

	make(driverClass, config) {
		return new this.queueClass(this.app, this, new driverClass(this.app, config))
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
