export function RoutesProvider(app) {

	app.routes.get('/', (req, res) => res.render('welcome.njk')).as('welcome.show')

}
