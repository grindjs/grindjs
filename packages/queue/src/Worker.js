export class Worker {
	connection = null

	constructor(connection) {
		this.connection = connection
	}

	work(queues) {
		return this.connection.willListen().then(() => this.connection.listen(queues))
	}

}
