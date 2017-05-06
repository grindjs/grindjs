import './QueueFactory'

import './Commands/MakeJobCommand'
import './Commands/QueueWorkCommand'

export function QueueProvider(app, classes = { }) {
	const factoryClass = classes.factoryClass || QueueFactory
	app.queue = new factoryClass(app)

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
