import { Command, InputOption } from 'grind-cli'

export class QueueWorkCommand extends Command {
	name = 'queue:work'
	description = 'Process jobs in the queue'

	options = [
		new InputOption('job', InputOption.VALUE_OPTIONAL, 'Restrict the name of job(s) to process')
	]

	ready() {
		const shutdown = () => {
			this.app.queue.kue.shutdown(5000, err => {
				if(!err.isNil) {
					Log.error('Error shutting down', err)
				}

				process.exit(0)
			})
		}

		process.once('SIGTERM', shutdown)
		process.once('SIGINT', shutdown)

		return super.ready()
	}

	run() {
		this.app.queue.kue.watchStuckJobs()
		this.app.queue.kue.on('error', err => {
			Log.error('Error', err)
		})

		let jobNames = null

		if(this.containsOption('job')) {
			jobNames = this.option('job').split(/,/)
		}

		return this.app.queue.process(jobNames)
	}

}
