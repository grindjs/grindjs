const { RouteExtension } = require('./Extensions/RouteExtension.js')

export function RoutingProvider(app) {
	RouteExtension()

	const routerClass = app.kernel.options.routerClass || require('./Router.js').Router
	const router = new routerClass(app)
	app.routes = router

	const boot = router.boot.bind(router)
	boot.priority = 35000
	app.providers.add(boot)
}

RoutingProvider.priority = Infinity
