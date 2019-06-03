import './QueueFactory'

import './Commands/QueueWorkCommand'

export function QueueProvider(app, { factoryClass, queueClass, ...classes } = { }) {
	factoryClass = factoryClass || QueueFactory
	app.queue = new factoryClass(app, { queueClass })

	if(app.cli.isNil) {
		return
	}

	app.cli.register([
		classes.queueWorkCommandClass || QueueWorkCommand
	])
}

QueueProvider.shutdown = app => app.queue.destroy()
QueueProvider.priority = 60000
