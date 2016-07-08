import 'App/Controllers/StatesController'

export function RoutesProvider(app) {

	app.routes.get('/', (req, res) => {
		res.redirect(301, '/swagger.json')
	})

	const states = new StatesController(app)

	app.routes.bind('state', (value, resolve, reject) => {
		states.repo.find(value.toUpperCase(), (row) => {
			if(row) {
				resolve(row)
			} else {
				reject(new NotFoundError('State not found'))
			}
		})
	}, {
		swagger: {
			name: 'state',
			in: 'path',
			required: true,
			description: 'State abbreviation',
			type: 'string'
		}
	})

	app.routes.group({ prefix: '/states', controller: states }, () => {

		app.routes.get('/', 'index', {
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

		app.routes.get('/search', 'search', {
			swagger: {
				description: 'Searches for states in the US.',
				parameters: [
					{
						name: 'term',
						in: 'query',
						required: true,
						description: 'Search term',
						type: 'string'
					}
				]
			}
		})

		app.routes.get('/:state', 'show', {
			swagger: {
				description: 'Lookup a state by it’s abbreviation.'
			}
		})

	})

}
