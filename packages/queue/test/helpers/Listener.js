import './TestJob'

export function Listener(queue, callback, canFail = false, queueName = TestJob.queue) {
	return new Promise(async (resolve, reject) => {
		const timeout = setTimeout(() => reject(new Error('Execution timed out')), 10000)

		try {
			await queue.listen([ queueName ], 1, {
				makeJob: payload => payload,
				execute: async job => {
					if(await callback(job) === true) {
						return
					}

					clearTimeout(timeout)
					return resolve()
				},
				handleError: (job, err) => {
					if(canFail) {
						return
					}

					clearTimeout(timeout)
					reject(err)
				}
			})
		} catch(err) {
			clearTimeout(timeout)
			reject(err)
		}
	})
}
