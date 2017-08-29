import './Devbar'
import './MockDevbar'

import './Collectors/DatabaseCollector'
import './Collectors/ViewCollector'

const path = require('path')

export function DevbarProvider(app, {
	devbarClass = Devbar,
	loadDevbar = _loadDevbar,
	cloneDevbar = _cloneDevbar
} = { }) {
	loadDevbar(app, devbarClass)

	if(!app.devbar.isMock) {
		app.routes.static('__devbar', path.join(__dirname, '../resources/assets'))
	}

	app.routes.use((req, res, next) => {
		const devbar = (cloneDevbar || _cloneDevbar)(req.app._grind, req, res)

		req.devbar = devbar
		res.devbar = devbar
		res.locals.devbar = devbar

		if(!devbar.isEnabled) {
			return next()
		}

		require('zone.js/dist/zone-node.js')

		global.Zone.current.fork({
			properties: {
				devbar: devbar,
				id: Math.random()
			}
		}).run(() => devbar.start(next))
	})
}

function _loadDevbar(app, devbarClass) {
	if(app.debug) {
		app.devbar = new devbarClass(app)
		app.devbar.register(DatabaseCollector)
		app.devbar.register(ViewCollector)
	} else {
		app.devbar = { ...MockDevbar }
	}
}

function _cloneDevbar(app, req, res) {
	return app.devbar.clone(req, res)
}

DevbarProvider.priority = 1000
