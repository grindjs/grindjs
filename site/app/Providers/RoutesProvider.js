import 'App/Controllers/HelloController'

export function RoutesProvider(app) {

	app.routes.get('/', (req, res) => {
		res.render('welcome.njk', {
			name: 'Grind'
		})
	}).as('welcome.show')

	app.routes.group({ prefix: 'hello', controller: HelloController }, routes => {
		routes.get('/', 'show')
	})

}
