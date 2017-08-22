import './BaseDriver'
import { MissingPackageError } from 'grind-framework'
const url = require('url')

let amqp = null

/**
 * Loads the amqplib package or throws an error
 * if it hasn‘t been added
 */
function loadPackage() {
	if(!amqp.isNil) {
		return
	}

	try {
		amqp = require('amqplib')
	} catch(err) {
		throw new MissingPackageError('amqplib')
	}
}

/**
 * RabbitMQ backed Queue Driver
 */
export class RabbitDriver extends BaseDriver {
	connection = null
	channel = null
	uri = null

	constructor(app, config) {
		super(app, config)

		loadPackage()

		const uri = {
			protocol: 'amqp:',
			slashes: true,
			hostname: config.host || 'localhost',
			port: config.port || 5672,
			pathname: config.virtual_host || config.virtualHost || '/'
		}

		if(!config.user.isNil) {
			uri.auth = config.user

			if(!config.password.isNil) {
				uri.password += `:${config.password}`
			}
		}

		if(!config.options.isNil) {
			uri.query = { ...config.options }
		}

		this.uri = url.format(uri)
	}

	async connect() {
		this.connection = await amqp.connect(this.uri)
		this.channel = await this.connection.createChannel()
	}

	async dispatch(job) {
		const payload = this.buildPayload(job)
		const options = {
			timestamp: Date.now(),
			type: payload.name,
			contentType: 'application/json',
			headers: {
				'x-try': 1,
				'x-retry-delay': payload.retry_delay
			}
		}

		if(payload.timeout > 0) {
			options.expiration = payload.timeout
		}

		if(payload.delay > 0) {
			options.headers['x-delay'] = payload.delay
		}

		await this.channel.assertQueue(payload.queue)
		return this.channel.sendToQueue(payload.queue, new Buffer(JSON.stringify(payload)), options)
	}

	async listen(queues, jobHandler, errorHandler) {
		const receiver = msg => {
			const payload = JSON.parse(msg.content)
			this.channel.ack(msg)

			jobHandler(payload).catch(err => {
				const tries = Number.parseInt(payload.tries) || 1

				if(tries <= 1) {
					throw err
				}

				const options = { ...msg.properties }
				options.headers = options.headers || { }

				const tryCount = Number.parseInt(options.headers['x-try']) || 1

				if(tryCount >= tries) {
					throw err
				} else {
					options.headers['x-try'] = tryCount + 1
					options.headers['x-delay'] = Number.parseInt(options.headers['x-retry-delay']) || 0
				}

				let expiration = Number.parseInt(options.expiration) || 0
				const timestamp = Number.parseInt(options.timestamp)

				if(expiration > 0) {
					expiration -= Date.now() - timestamp

					if(expiration <= 0) {
						throw err
					}

					options.expiration = expiration
					options.timestamp = Date.now()
				}

				return this.channel.publish(msg.fields.exchange, msg.fields.routingKey, msg.content, options)
			}).catch(err => errorHandler(payload, err))
		}

		for(const queue of queues) {
			await this.channel.assertQueue(queue)
		}

		await Promise.all(queues.map(queue => this.channel.consume(queue, receiver)))

		return new Promise(() => { })
	}

	async destroy() {
		await this.channel.close()
		this.channel = null

		await this.connection.close()
		this.connection = null
	}

}
