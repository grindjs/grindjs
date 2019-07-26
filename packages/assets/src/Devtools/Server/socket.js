import { MissingPackageError } from 'grind-framework'

let ws = null

try {
	ws = require('ws')
} catch(err) {
	throw new MissingPackageError('ws', 'dev')
}

export function socket(app) {
	app.assets.websocket = app.routes.upgrade('@assets/socket')

	app.assets.websocket.replayLog = [ ]
	app.assets.websocket.sendAll = sendAll.bind(null, app.assets.websocket)
}

function sendAll(wss, data, shouldReplayAfterConnect) {
	if(shouldReplayAfterConnect) {
		const cutoff = Date.now() - 5000
		wss.replayLog = wss.replayLog.filter(({ ts }) => ts > cutoff)
		wss.replayLog.push({ ts: Date.now(), data })
	}

	data = JSON.stringify(data)

	for(const client of wss.clients) {
		if(client.readyState !== ws.OPEN) {
			continue
		}

		client.send(data)
	}
}
