import 'App/Controllers/StatesController'

export function RoutesProvider(app) {

	app.routes.get('/', (req, res) => {
		res.redirect(301, '/states')
	})

	app.routes.group({ prefix: '/states', controller: new StatesController(app) }, () => {

		app.routes.get( '/', 'index', {
			swagger: {
				description: 'Returns a list of states in the US.',
				parameters: [
					{
						name: 'limit',
						in: 'query',
						required: false,
						description: 'Maximum number of states to return',
						type: 'integer'
					}, {
						name: 'offset',
						in: 'query',
						required: false,
						description: 'Number of records to skip',
						type: 'integer'
					}
				]
			}
		})

		app.routes.get( '/search', 'search', {
			swagger: {
				description: 'Searches for states in the US.',
				parameters: [{
					name: 'term',
					in: 'query',
					required: true,
					description: 'Search term',
					type: 'string'
				}]
			}
		})


		app.routes.get( '/:abbr', 'show', {
			swagger: {
				description: 'Lookup a state by it’s abbreviation.',
				parameters: [{
					name: 'abbr',
					in: 'path',
					required: true,
					description: 'State abbreviation',
					type: 'string'
				}]
			}
		})

	})

}
