const path = require('path')

export function watch(app) {
	const base = app.paths.base()
	const assets = path.join(base, app.config.get('assets.paths.source'))
	app.assets.watcher = require('chokidar').watch(assets)

	app.assets.watcher.on('ready', () => {
		app.assets.watcher.on('all', (type, asset) => {
			try {
				asset = path.relative(base, asset)
				app.assets.websocket.sendAll({ type: 'change', asset })
			} catch(err) {
				Log.error('Error notifying clients', err)
			}
		})
	})
}
