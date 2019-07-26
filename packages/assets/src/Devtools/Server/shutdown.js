export function shutdown(app) {
	if(!app.assets.websocket.isNil) {
		app.assets.websocket.close()
		app.assets.websocket = null
	}

	if(!app.assets.watcher.isNil) {
		app.assets.watcher.close()
		app.assets.watcher = null
	}
}
