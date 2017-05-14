import { Command, InputOption } from 'grind-cli'

export class QueueWorkCommand extends Command {
	name = 'queue:work'
	description = 'Process jobs in the queue'

	options = [
		new InputOption('job', InputOption.VALUE_OPTIONAL, 'Restrict the name of job(s) to process'),
		new InputOption('watch', InputOption.VALUE_OPTIONAL, 'Folders to watch for changes')
	]

	async ready() {
		let app = this

		if(this.containsOption('watch')) {
			app = await this.cli.runner.watch(this, 'watch')
		}

		const shutdown = () => {
			app.app.queue.destroy().catch(err => {
				Log.error('Error shutting down', err)
			}).then(() => process.exit(0))
		}

		process.once('SIGTERM', shutdown)
		process.once('SIGINT', shutdown)

		return super.ready()
	}

	async run() {
		let jobNames = null

		if(this.containsOption('job')) {
			jobNames = this.option('job').split(/,/).map(job => job.trim())
		} else {
			jobNames = Object.keys(this.app.queue.jobs)
		}

		const queue = this.app.queue.get()
		await queue.willListen()

		return queue.listen(jobNames)
	}

}
