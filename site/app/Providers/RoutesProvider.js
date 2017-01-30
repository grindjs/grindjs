import 'App/Controllers/DocsController'

export function RoutesProvider(app) {

	app.routes.get('/', (req, res) => res.render('welcome.show')).as('welcome.show')

	app.routes.group({ prefix: 'docs', controller: DocsController }, routes => {
		routes.get(':group?/:a?/:b?/:c?/:d?/:e?/:f?', 'show').as('docs.show')
	})

}
