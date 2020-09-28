import errorOverlayMiddleware from 'react-dev-utils/errorOverlayMiddleware'
const path = require('path')

export function ReactDevProvider(app) {
	if (process.env.NODE_ENV === 'production') {
		Log.errror('WARNING: `@grindjs/react-dev` should not be used in production.')
	}

	if (app.http.isNil) {
		return
	}

	const script = '/@assets/react-dev.js'
	app.routes.static(script, path.join(__dirname, '../dist/react-dev.min.js'))

	app.routes.use((req, res, next) => {
		if (!res.locals._assetContainer.isNil) {
			res.locals._assetContainer._internalScripts.push(script)
		}

		next()
	})

	app.routes.use(errorOverlayMiddleware())
}

ReactDevProvider.priority = 9000
