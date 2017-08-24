import { Command, InputArgument, InputOption } from 'grind-cli'
import '../Worker'

export class QueueWorkCommand extends Command {
	name = 'queue:work'
	description = 'Process jobs in the queue'

	arguments = [
		new InputArgument('connection', InputArgument.VALUE_OPTIONAL, 'Connection to perform work for.')
	]

	options = [
		new InputOption('queue', InputOption.VALUE_OPTIONAL, 'Specify the queue(s) to perform work for.'),
		new InputOption('concurrency', InputOption.VALUE_OPTIONAL, 'Number of jobs to process concurrency.', '1'),
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
		let queues = null
		const connection = this.app.queue.get(this.argument('connection'))

		if(this.containsOption('queue')) {
			queues = this.option('queue').split(/,/).map(job => job.trim()).filter(job => job.length > 0)
		}

		const worker = new Worker(connection)
		return worker.work(queues, Number.parseInt(this.option('concurrency', 1)) || 1)
	}

}
