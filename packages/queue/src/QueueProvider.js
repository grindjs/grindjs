import './QueueFactory'

import './Commands/QueueWorkCommand'

const path = require('path')

export function QueueProvider(app, { factoryClass, queueClass, ...classes } = { }) {
	app.config.loadDefault('queue', path.join(__dirname, '../config/queue.json'))

	factoryClass = factoryClass || QueueFactory
	app.queue = new factoryClass(app, { queueClass })

	if(!app.cli.isNil) {
		app.cli.register([
			classes.queueWorkCommandClass || QueueWorkCommand
		])
	}

	if(app.queue.stateful && !app.http.isNil) {
		app.routes.group({
			prefix: app.config.get('queue.stateful.route'),
			controller: classes.queueControllerClass || require('./Controllers/QueueController').QueueController
		}, routes => {
			routes.get(':job', 'status')
		})
	}
}

QueueProvider.shutdown = app => app.queue.destroy()
QueueProvider.priority = 60000
