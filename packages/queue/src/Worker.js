export class Worker {
	connection = null

	constructor(connection) {
		this.connection = connection
	}

	work(queues, concurrency = 1) {
		return this.connection.willListen().then(() => this.connection.listen(queues, concurrency))
	}

}
