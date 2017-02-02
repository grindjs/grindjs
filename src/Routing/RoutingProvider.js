export function RoutingProvider(app) {
	return app.routes.boot()
}

RoutingProvider.priority = 35000
