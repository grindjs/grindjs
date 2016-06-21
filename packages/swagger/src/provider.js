import path from 'path'
import findRoot from 'find-root'

export function provider(app) {

	app.use((req, res, next) => {
		res.setHeader('Access-Control-Allow-Origin', '*')
		next()
	})

	app.get('/swagger.json', (req, res) => {
		const router = app._router
		const stack = router ? router.stack : null

		if(router == null || router.length <= 0) {
			console.error('You haven’t registered any routes yet.')
			process.exit(1)
		}

		const root = findRoot(path.dirname(require.main.filename))
		const info = require(root + '/package.json')

		var paths = { }

		for(const r of stack) {
			const route = r.route
			if(!route) { continue }

			const swagger = route.extra != null ? route.extra.swagger : null
			var routePath = route.path
			var method = route.methods

			if(typeof method === 'object') {
				method = Object.keys(method)[0]
			} else {
				method = null
			}

			if(!swagger || !routePath || !method) { continue }

			swagger.parameters = swagger.parameters || []

			if(typeof swagger.parameters === 'object' && !Array.isArray(swagger.parameters)) {
				const parameters = [ ]

				for(const entry of Object.entries(swagger.parameters)) {
					const parameter = entry[1]

					if(parameter.name.isNil) {
						parameter.name = entry[0]
					}

					parameters.push(parameter)
				}

				swagger.parameters = parameters
			}

			routePath = routePath.replace(/:([a-z0-0_\-\.]+)(?:\(([^\)]+)\))?(\?)?/g, (_, name, pattern, optional) => {
				var parameter = null

				for(const p of swagger.parameters) {
					if(p.name === name) {
						parameter = p
						break
					}
				}

				if(parameter === null) {
					const binding = app.routes.bindings[name]

					if(!binding.isNil && !binding.extra.isNil && !binding.extra.swagger.isNil) {
						parameter = Object.assign({ }, app.routes.bindings[name].extra.swagger)
						swagger.parameters.push(parameter)
					}
				}

				if(parameter !== null) {
					if(typeof pattern === 'string') {
						parameter.pattern = pattern
					}

					if(parameter.required.isNil) {
						parameter.required = optional !== '?'
					}
				}

				return '{' + name + '}'
			})

			for(const parameter of swagger.parameters) {
				if(parameter.in === 'url') {
					continue
				}

				if(parameter.required.isNil) {
					parameter.required = method !== 'GET'
				}
			}

			if(swagger.parameters.length === 0) {
				delete swagger.parameters
			}

			var obj = paths[routePath] || { }
			obj[method] = swagger
			paths[routePath] = obj
		}

		res.setHeader('Access-Control-Allow-Origin', '*')
		res.send({
			swagger: '2.0',
			info: {
				version: info.version || '0.0.1',
				title: info.name
			},
			basePath: '/',
			host: req.get('Host'),
			schemes: [ 'http' ],
			consumes: [ 'application/json' ],
			produces: [ 'application/json' ],
			paths: paths
		})
	})
}
