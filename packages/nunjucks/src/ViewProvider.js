import './ViewFactory'
import './ViewCacheCommand'
import './ViewClearCommand'

export async function ViewProvider(app) {
	app.view = new ViewFactory(app)
	await app.view.bootstrap()

	app.routes.use((req, res, next) => {
		res.locals.url = app.url.clone(req)
		next()
	})

	if(!app.cli.isNil) {
		app.cli.register(ViewCacheCommand)
		app.cli.register(ViewClearCommand)
	}
}

ViewProvider.priority = 30000
