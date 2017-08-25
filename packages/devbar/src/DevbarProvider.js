import './Devbar'
import './MockDevbar'
import './Collectors/DatabaseCollector'

const path = require('path')

export function DevbarProvider(app, { devbarClass = Devbar } = { }) {
	if(app.debug) {
		app.routes.static('__devbar', path.join(__dirname, '../resources/assets'))
		app.devbar = new devbarClass(app)
		app.devbar.register(DatabaseCollector)
	} else {
		app.devbar = { ...MockDevbar }
	}

	app.routes.use((req, res, next) => {
		require('zone.js/dist/zone-node.js')
		const devbar = req.app._grind.devbar.clone(req, res)

		global.Zone.current.fork({
			properties: {
				devbar: devbar,
				id: Math.random()
			}
		}).run(() => {
			req.devbar = devbar
			res.devbar = devbar
			res.locals.devbar = devbar
			return devbar.start(next)
		})
	})
}

DevbarProvider.priority = 1000
