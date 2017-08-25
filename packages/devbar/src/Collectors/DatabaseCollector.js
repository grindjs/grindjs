import './EventCollectorBuilder'

export function DatabaseCollector(app, devbar) {
	if(app.db.isNil || app.db.client.isNil) {
		return
	}

	const events = EventCollectorBuilder(app, devbar, app.db.client)

	events.on('query-response', (devbar, result, obj) => {
		obj.__devbarStart = process.hrtime()
	})

	events.on('query-response', (devbar, result, obj) => {
		if(obj.__devbarStart.isNil) {
			return
		}

		const duration = process.hrtime(obj.__devbarStart)

		devbar.add('Queries', {
			message: app.db.client._formatQuery(obj.sql, obj.bindings),
			start: obj.__devbarStart,
			duration: duration
		})
	})
}
