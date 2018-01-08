import './TestJob'

export function Listener(queue, callback, canFail = false) {
	return new Promise(async (resolve, reject) => {
		const timeout = setTimeout(() => reject(new Error('Execution timed out')), 10000)

		try {
			await queue.listen(
				[ TestJob.queue ],
				1,
				async job => {
					if(await callback(job) === true) {
						return
					}

					clearTimeout(timeout)
					return resolve()
				},
				(job, err) => {
					if(canFail) {
						return
					}

					clearTimeout(timeout)
					reject(err)
				}
			)
		} catch(err) {
			clearTimeout(timeout)
			reject(err)
		}
	})
}
