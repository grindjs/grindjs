import { MissingPackageError } from 'grind-framework'
const path = require('path')

let ws = null

try {
	ws = require('ws')
} catch(err) {
	throw new MissingPackageError('ws', 'dev')
}

export function LiveReloadProvider(app) {
	app.on('listen', listen)
	app.on('shutdown', shutdown)

	const script = '/_livereload.js'

	if(global._assetsUsePrepackagedLiveReload) {
		app.routes.static(script, path.join(__dirname, '../../../dist/livereload.min.js'))
	} else {
		app.routes.get(script, (req, res) => {
			return app.assets.controller._serve(req, res, app.assets.make(path.join(__dirname, 'Client/LiveReload.js')))
		})
	}

	app.routes.use((req, res, next) => {
		res.locals._assetContainer._scripts.push(script)
		next()
	})
}

function listen(app, server) {
	app.assets.liveReload = new ws.Server({
		server: server,
		path: '/_livereload'
	})

	const resources = app.paths.base('resources')
	const assets = app.paths.base('resources/assets')
	app.assets.watcher = require('chokidar').watch(assets)

	app.assets.watcher.on('ready', () => {
		app.assets.watcher.on('all', (type, path) => {
			try {
				path = path.substring(resources.length)

				for(const client of app.assets.liveReload.clients) {
					if(client.readyState !== ws.OPEN) {
						continue
					}

					client.send(path)
				}
			} catch(err) {
				Log.error('Error notifying clients', err)
			}
		})
	})
}

function shutdown(app) {
	if(!app.assets.liveReload.isNil) {
		app.assets.liveReload.close()
		app.assets.liveReload = null
	}

	if(!app.assets.watcher.isNil) {
		app.assets.watcher.close()
		app.assets.watcher = null
	}
}
