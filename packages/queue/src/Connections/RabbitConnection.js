import './BaseConnection'

import { MissingPackageError } from 'grind-framework'

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

export class RabbitConnection extends BaseConnection {

	_connection = null
	_channel = null
	config = null

	constructor(config) {
		super(config)

		this.config = config
		loadPackage()
	}

	open() {
		this._open().then(() => {
			this.emit('open')
		}).catch(err => {
			this.emit('error', err)
		})
	}

	async _open() {
		try {
			this._connection = await amqp.connect(this.config)
			this._channel = await this._connection.createConfirmChannel()

			this._channel.on('error', this.emit.bind(this, 'error'))
			this._channel.on('close', this.emit.bind(this, 'close'))
			this._connection.on('error', this.emit.bind(this, 'error'))
			this._connection.on('close', this.emit.bind(this, 'close'))
		} catch(err) {
			throw err
		}
	}

	connection() {
		return this.perform(() => this._connection)
	}

	channel() {
		return this.perform(() => this._channel)
	}

	close() {
		try {
			if(!this._channel.isNil) {
				Promise.resolve(this._channel.close()).catch(err => Log.error('Error closing channel', err))
				this._channel = null
			}

			if(this._connection.isNil) {
				Promise.resolve(this._connection.close()).catch(err => Log.error('Error closing connection', err))
				this._connection = null
			}
		} catch(err) {
			Log.error('Error closing rabbit', err)
		}

		this.emit('close')
	}

}
