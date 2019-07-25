import 'App/Controllers/RootController'

export function RoutesProvider(app) {
	app.routes.group({ controller: RootController }, routes => {
		routes.get('*', 'index').as('root')
	})
}
