import './Queue'

import './Commands/MakeJobCommand'
import './Commands/QueueWorkCommand'

export function QueueProvider(app, classes = { }) {
	const queueClass = classes.queueClass || Queue
	app.queue = new queueClass(app)

	if(app.cli.isNil) {
		return
	}

	app.cli.register([
		classes.makeJobCommandClass || MakeJobCommand,
		classes.queueWorkCommandClass || QueueWorkCommand
	])
}

QueueProvider.shutdown = app => app.queue.destroy()
QueueProvider.priority = 60000
