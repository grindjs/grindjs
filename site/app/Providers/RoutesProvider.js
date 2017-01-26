import 'App/Controllers/DocsController'

export function RoutesProvider(app) {

	app.routes.get('/', (req, res) => res.render('welcome.show')).as('welcome.show')

	app.routes.group({ prefix: 'docs', controller: DocsController }, routes => {
		routes.get(':a?/:b?/:c?/:d?', 'show').as('docs.show')
	})

}
