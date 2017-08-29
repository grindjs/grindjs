import './EventCollectorBuilder'
import '../Containers/TimelineContainer'

export function DatabaseCollector(app, devbar) {
	if(app.db.isNil || app.db.client.isNil) {
		return
	}

	const events = EventCollectorBuilder(app, devbar, app.db.client)
	const timeline = new TimelineContainer('Queries')
	timeline.shouldDisplay = false
	devbar.containers.queries = timeline

	events.on('query', (devbar, obj) => {
		timeline.shouldDisplay = true
		timeline.time(obj.__knexQueryUid, app.db.client._formatQuery(obj.sql, obj.bindings))
	})

	events.on('query-response', (devbar, result, obj) => {
		timeline.timeEnd(obj.__knexQueryUid)
	})
}
