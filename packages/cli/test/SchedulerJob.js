import test from 'ava'
import '../src/SchedulerJob'

test.cb('timeout', t => {
	t.plan(1)

	const job = new SchedulerJob
	job.cli = {
		output: {
			writeln: () => { }
		}
	}

	job.withTimeout(100)

	const timeout = setTimeout(() => {
		t.fail('Job did not timeout.')
		t.end()
	}, 200)

	job.executeCommand({
		spawn: () => {
			const promise = new Promise(() => { })
			promise.childProcess = {
				kill: () => {
					clearTimeout(timeout)
					t.pass()
					t.end()
				}
			}

			return promise
		}
	})

})
