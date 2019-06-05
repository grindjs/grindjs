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
		virtual_host: virtualHostUnderscore,
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
			vhost: virtualHostUnderscore || virtualHost || '/',
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

	async listen(queues, concurrency, context) {
		const channel = await this.channel()

		await channel.prefetch(concurrency, queues.length > 1)

		for(const queue of queues) {
			await channel.assertQueue(queue)
		}

		const receiver = this.receivePayload.bind(this, context)
		await Promise.all(queues.map(queue => channel.consume(queue, receiver)))

		return new Promise((resolve, reject) => {
			this.connection.on('connection:fatal', reject)
		})
	}

	async receivePayload(context, msg) {
		const payload = JSON.parse(msg.content)

		try {
			await super.receivePayload({
				...context,
				rabbit: { msg }
			}, payload)
		} catch(err) {
			throw err
		} finally {
			const channel = await this.channel()
			await channel.ack(msg)
		}
	}

	async retryOrRethrow(context, payload, job, error) {
		const tries = Number.parseInt(payload.tries) || 1

		if(tries <= 1) {
			throw error
		}

		const { msg } = context.rabbit
		const options = { ...msg.properties }
		options.headers = options.headers || { }

		const tryCount = Number.parseInt(options.headers['x-try']) || 1

		if(tryCount >= tries) {
			throw error
		} else {
			options.headers['x-try'] = tryCount + 1
			options.headers['x-delay'] = Number.parseInt(options.headers['x-retry-delay']) || 0
		}

		let expiration = Number.parseInt(options.expiration) || 0
		const timestamp = Number.parseInt(options.timestamp)

		if(expiration > 0) {
			expiration -= Date.now() - timestamp

			if(expiration <= 0) {
				throw error
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
