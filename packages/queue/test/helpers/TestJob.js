import '../../src/Job'

export class TestJob extends Job {

	static queue = 'test'
	static retryDelay = 1000

	data = null

	constructor(data) {
		super()

		this.data = data
	}

}
