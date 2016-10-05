import './ViewFactory'

export function ViewProvider(app) {
	app.view = new ViewFactory(app)

	app.routes.use((req, res, next) => {
		res.locals.url = app.url.clone(req)
		next()
	})

}

ViewProvider.priority = 30000
