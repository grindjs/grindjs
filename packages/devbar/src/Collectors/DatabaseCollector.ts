import { Application } from '@grindjs/framework'

import { TimelineContainer } from '../Containers/TimelineContainer'
import { IDevbar } from '../IDevbar'
import { EventCollectorBuilder } from './EventCollectorBuilder'

export function DatabaseCollector(app: Application, devbar: IDevbar) {
	const db = (app as any)?.db

	if (!db?.client) {
		return
	}

	const events = EventCollectorBuilder(app, devbar, db.client)
	const timeline = new TimelineContainer('Queries')
	timeline.shouldDisplay = false
	devbar.containers.queries = timeline

	events.on('query', (devbar, obj) => {
		timeline.shouldDisplay = true
		timeline.time(obj.__knexQueryUid, db.client._formatQuery(obj.sql, obj.bindings))
	})

	events.on('query-response', (devbar, result, obj) => {
		timeline.timeEnd(obj.__knexQueryUid)
	})
}
