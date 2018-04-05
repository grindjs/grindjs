import './BaseDriver'

export class BaseConnectionDriver extends BaseDriver {

	connectionClass = null
	connection = null
	config = null

	connect() {
		this.connection = new this.connectionClass(this.config)
		this.connection.connect()

		return this.connection.perform(() => { })
	}

	destroy() {
		return this.connection.destroy()
	}

}
