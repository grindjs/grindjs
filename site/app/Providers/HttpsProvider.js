import 'App/Middleware/HttpsMiddleware'

export function HttpsProvider(app) {
	app.routes.trustProxy(true)
	app.routes.use(HttpsMiddleware(app))
}
