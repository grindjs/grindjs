const path = require('path')

export function inject(app) {
	const script = '/@assets/devtools.js'

	if(global._assetsUsePrepackagedLiveReload !== false) {
		app.routes.static(script, path.join(__dirname, '../../../dist/devtools.min.js'))
	} else {
		app.routes.get(script, (req, res) => {
			return app.assets.controller._serve(req, res, app.assets.make(path.join(__dirname, '../Browser/Devtools.js')))
		})
	}

	app.routes.use((req, res, next) => {
		res.locals._assetContainer._scripts.push({
			src: script,
			['data-since']: Date.now()
		})
		next()
	})
}
