import test from 'ava'
import './helpers/request'
import '../src/Swagger'

function getSwagger() {
	return request(0, app => {
		const handler = (req, res) => res.send(req.path)

		Swagger.learn('featured', { type: 'boolean' })
		Swagger.parameters('pagination', {
			limit: {
				description: 'Limit the number of records',
				type: 'integer'
			},
			offset: {
				description: 'Skip records before querying',
				type: 'integer'
			}
		})

		app.routes.get('states', handler, {
			swagger: {
				description: 'Gets a list of states',
				use: [ 'pagination' ],
				parameters: {
					featured: 'Filter states by featured'
				}
			}
		})

		app.routes.get(':state/cities', handler, {
			swagger: {
				description: 'Gets a list of cities in a state',
				use: [ 'pagination' ],
				parameters: {
					state: 'Abbreviation of a state',
					featured: 'Filter cities by featured'
				}
			}
		})
	}, 'swagger.json', { json: true }).then(response => response.body)
}

test('metadata', async t => {
	const swagger = await getSwagger()
	t.is(swagger.swagger, '2.0')
	t.is(swagger.basePath, '/')
	t.is(swagger.info.version, require('../package.json').version)
	t.is(swagger.info.title, require('../package.json').name)

	t.deepEqual(swagger.produces, [ 'application/json' ])
	t.deepEqual(Object.keys(swagger.paths), [ '/states', '/{state}/cities' ])
})

test('learn', async t => {
	const swagger = await getSwagger()
	const cities = swagger.paths['/{state}/cities'].get.parameters
	t.is(cities[1].in, 'query')
	t.is(cities[1].name, 'featured')
	t.is(cities[1].required, false)
	t.is(cities[1].type, 'boolean')
})

test('shared', async t => {
	const swagger = await getSwagger()
	const states = swagger.paths['/states'].get.parameters

	t.is(states[1].in, 'query')
	t.is(states[1].name, 'limit')
	t.is(states[1].required, false)
	t.is(states[1].type, 'integer')

	t.is(states[2].in, 'query')
	t.is(states[2].name, 'offset')
	t.is(states[2].required, false)
	t.is(states[2].type, 'integer')
})
