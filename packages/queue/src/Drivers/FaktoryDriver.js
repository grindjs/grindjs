import './BaseDriver'
import { MissingPackageError } from 'grind-framework'

let Client = null
let Manager = null

/**
 * Faktory backed Queue Driver
 */
export class FaktoryDriver extends BaseDriver {

	connection = null
	channel = null
	uri = null

	constructor(app, config) {
		super(app, config)

		loadPackage()

		this.config = config
	}

	connect() {
		this.client = new Client(this.config.connection)
		return this.client.connect()
	}


	get isAlive() {
		return (
			!this.client.isNil
			&& !this.client.socket.isNil
			&& !this.client.socket.destroyed
			&& this.client.connected
		)
	}

	async dispatch(job) {
		if(!this.isAlive) {
			await this.connect()
		}

		const payload = this.buildPayload(job)
		const at = payload.delay.isNil ? null : (new Date(Date.now() + payload.delay))
		payload.try = 1
		payload.queued_at = (at || new Date).getTime()

		return this._push(payload, at)
	}

	async listen(queues, concurrency, context) {
		this.manager = new Manager({
			...this.config,
			queues,
			concurrency,
			registry: {
				'grind-job': this.receivePayload.bind(this, context)
			}
		})

		this.manager.trapSignals = () => { }
		this.manager.run()

		return new Promise(() => { })
	}

	retry(context, payload, at) {
		return this._push(payload, at)
	}

	_push(payload, at) {
		return this.client.push({
			jobtype: 'grind-job',
			queue: payload.queue,
			retry: 0,
			at: at === null ? null : at.toISOString(),
			args: [ payload ]
		})
	}

	async destroy() {
		if(!this.manager.isNil) {
			await this.manager.stop()
			this.manager = null
		}

		if(!this.client.isNil) {
			await this.client.close()
			this.client = null
		}
	}

}

/**
 * Loads the faktory-client + faktory-worker packages
 * or throws an error if they haven’t been added
 */
function loadPackage() {
	if(!Client.isNil) {
		return
	}

	try {
		Manager = require('faktory-worker/lib/manager')
	} catch(err) {
		throw new MissingPackageError('faktory-worker')
	}

	try {
		Client = require('faktory-client')
	} catch(err) {
		throw new MissingPackageError('faktory-worker')
	}
}
