export function ExpressProvider(app) {
	const express = require('express/lib/express.js')
	app.express = express()
	app.express.disable('etag')
	app.express._grind = app
	app.enable = app.express.enable.bind(app.express)
	app.disable = app.express.disable.bind(app.express)
}

ExpressProvider.priority = Infinity
