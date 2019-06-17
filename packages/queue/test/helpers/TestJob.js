import '../../src/Job'

export class TestJob extends Job {

	static jobName = 'test-job'
	static queue = 'test'
	static retryDelay = 1000

	data
	fail
	wait

	constructor({ fail = false, wait = null, result = null, ...data }) {
		super()

		this.data = data
		this.fail = fail
		this.wait = wait
		this.result = result
	}

	async $handle() {
		this.$result = this.result

		if(typeof this.wait === 'number') {
			await new Promise(resolve => setTimeout(resolve, this.wait))
		}

		if(this.fail) {
			throw new Error('Failing')
		}
	}

}
