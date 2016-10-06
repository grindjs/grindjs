import './Queue'

import './Commands/QueueWorkCommand'

export function QueueProvider(app) {
	app.queue = new Queue(app)

	if(app.cli.isNil) {
		return
	}

	app.cli.register([
		QueueWorkCommand
	])
}

QueueProvider.shutdown = app => app.queue.destroy()
QueueProvider.priority = 60000
