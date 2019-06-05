export class Worker {

	connection = null

	constructor(connection) {
		this.connection = connection
	}

	async work(queues, concurrency = 1) {
		await this.connection.willListen()

		return this.connection.listen(queues, concurrency)
	}

}
