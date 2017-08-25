import './Devbar'
import './MockDevbar'

const path = require('path')

export function DevbarProvider(app, { devbarClass = Devbar } = { }) {
	if(app.debug) {
		app.routes.static('__devbar', path.join(__dirname, '../resources/assets'))
		app.devbar = new devbarClass(app)
	} else {
		app.devbar = { ...MockDevbar }
	}

	app.routes.use((req, res, next) => {
		const devbar = req.app._grind.devbar.clone(req, res)
		req.devbar = devbar
		res.devbar = devbar
		res.locals.devbar = devbar
		return devbar.start(next)
	})
}

DevbarProvider.priority = 1000
