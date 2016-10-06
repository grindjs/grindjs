import { Command } from 'grind-cli'

export class QueueWorkCommand extends Command {
	name = 'queue:work'
	description = 'Process jobs in the queue'
	arguments = [ ]
	options = { }

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

		return new Promise(() => this.app.queue.process())
	}

}
