import 'App/Controllers/StatesController'

import {Swagger} from 'grind-swagger'

export function RoutesProvider(app) {

	app.routes.get('/', (req, res) => {
		res.redirect(301, '/swagger.json')
	})

	//
	// Shared parameters
	//

	Swagger.parameters('pagination', {
		limit: 'Limit the number of records',
		offset: 'Number of records to skip before querying'
	})

	Swagger.parameter('requiredTerm', {
		name: 'term',
		description: 'Search term',
		required: true
	})

	//
	// States Controller
	//

	const states = new StatesController(app)
	states.model.routeBind('state')

	app.routes.group({ prefix: 'states', controller: states }, routes => {
		routes.get('/', 'index', {
			swagger: {
				description: 'Returns a list of states in the US.',
				use: 'pagination'
			}
		})

		routes.get('search', 'search', {
			swagger: {
				description: 'Searches for states in the US.',
				use: [ 'pagination', 'requiredTerm' ]
			}
		})

		routes.get(':state', 'show', {
			swagger: 'Lookup a state by it’s abbreviation.'
		})
	})

}
