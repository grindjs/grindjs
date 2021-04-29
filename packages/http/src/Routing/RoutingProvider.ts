import { Application } from '@grindjs/framework'

import { RouteExtension } from './Extensions/RouteExtension'

export async function RoutingProvider(app: Application) {
	RouteExtension()

	const routerClass = app.kernel.options.routerClass || (await import('./Router')).Router
	const router = new routerClass(app)
	app.routes = router

	const boot = router.boot.bind(router)
	boot.priority = 35000
	app.providers.add(boot)
}

RoutingProvider.priority = Infinity

declare module '@grindjs/framework' {
	interface Application {
		routes?: import('./Router').Router
	}
}
