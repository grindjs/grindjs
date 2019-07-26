import { MissingPackageError } from 'grind-framework'
const path = require('path')

let ws = null

try {
	ws = require('ws')
} catch(err) {
	throw new MissingPackageError('ws', 'dev')
}

export function DevtoolsProvider(app) {
	app.assets.websocket = app.routes.upgrade('@assets/socket')
	app.on('shutdown', shutdown)

	watch(app)
	inject(app)
}

function watch(app) {
	const base = app.paths.base()
	const assets = path.join(base, app.config.get('assets.paths.source'))
	app.assets.watcher = require('chokidar').watch(assets)

	app.assets.watcher.on('ready', () => {
		app.assets.watcher.on('all', (type, asset) => {
			try {
				asset = path.relative(base, asset)

				for(const client of app.assets.websocket.clients) {
					if(client.readyState !== ws.OPEN) {
						continue
					}

					client.send(JSON.stringify({ type: 'change', asset }))
				}
			} catch(err) {
				Log.error('Error notifying clients', err)
			}
		})
	})
}

function inject(app) {
	const script = '/@assets/devtools.js'

	if(global._assetsUsePrepackagedLiveReload !== false) {
		app.routes.static(script, path.join(__dirname, '../../dist/devtools.min.js'))
	} else {
		app.routes.get(script, (req, res) => {
			return app.assets.controller._serve(req, res, app.assets.make(path.join(__dirname, 'Browser/Devtools.js')))
		})
	}

	app.routes.use((req, res, next) => {
		res.locals._assetContainer._scripts.push(script)
		next()
	})
}

function shutdown(app) {
	if(!app.assets.websocket.isNil) {
		app.assets.websocket.close()
		app.assets.websocket = null
	}

	if(!app.assets.watcher.isNil) {
		app.assets.watcher.close()
		app.assets.watcher = null
	}
}
