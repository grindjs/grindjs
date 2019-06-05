import './BaseConnectionDriver'
import '../Connections/RabbitConnection'

/**
 * RabbitMQ backed Queue Driver
 */
export class RabbitDriver extends BaseConnectionDriver {

	connectionClass = RabbitConnection

	constructor(app, {
		connection: {
			host = 'localhost',
			port = 5672,
			user,
			password,
		} = { },
		virtual_host,
		virtualHost,
		...options
	} = { }) {
		super(app, options)

		this.config = {
			protocol: 'amqp',
			hostname: host,
			port: port,
			username: user,
			password: password,
			vhost: virtual_host || virtualHost || '/',
			...options
		}
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

		const channel = await this.channel()
		await channel.assertQueue(payload.queue)
		await channel.sendToQueue(payload.queue, new Buffer(JSON.stringify(payload)), options)
		return channel.waitForConfirms()
	}

	async listen(queues, concurrency, jobHandler, errorHandler) {
		const channel = await this.channel()

		await channel.prefetch(concurrency, queues.length > 1)

		for(const queue of queues) {
			await channel.assertQueue(queue)
		}

		const receiver = this._receiveMessage.bind(this, jobHandler, errorHandler)
		await Promise.all(queues.map(queue => channel.consume(queue, receiver)))

		return new Promise((resolve, reject) => {
			this.connection.on('connection:fatal', reject)
		})
	}

	async _receiveMessage(jobHandler, errorHandler, msg) {
		const payload = JSON.parse(msg.content)

		try {
			await jobHandler(payload)
		} catch(err) {
			try {
				await this._retryMessageOrRethrow(msg, payload, err)
			} catch(err2) {
				await errorHandler(payload, err)
			}
		} finally {
			const channel = await this.channel()
			await channel.ack(msg)
		}
	}

	async _retryMessageOrRethrow(msg, payload, err) {
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

		const channel = await this.channel()

		return channel.publish(
			msg.fields.exchange,
			msg.fields.routingKey,
			msg.content,
			options
		)
	}

	channel() {
		return this.connection.channel()
	}

}
