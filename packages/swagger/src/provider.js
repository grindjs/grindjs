import {compileRoute} from './compile-route'
import {Swagger} from './swagger'

export function provider(app) {

	app.get('/swagger.json', (req, res) => {
		const router = app._router
		const stack = router ? router.stack : null

		if(router.isNil || router.length <= 0) {
			res.status(400).send({
				error: 'No defined routes'
			})

			return
		}

		const info = require(app.paths.package)

		var paths = { }

		for(const r of stack) {
			const route = r.route
			if(!route) { continue }

			const result = compileRoute(route, app)

			if(result.isNil) {
				continue
			}

			const { routePath, method, swagger } = result

			var obj = paths[routePath] || { }
			obj[method] = swagger
			paths[routePath] = obj
		}

		res.setHeader('Access-Control-Allow-Origin', '*')
		res.send({
			swagger: '2.0',
			info: {
				version: Swagger.appVersion || info.version || '0.0.1',
				title: Swagger.appName || info.name
			},
			basePath: Swagger.basePath,
			host: Swagger.host || req.get('Host'),
			schemes: Swagger.schemes || [ 'http' ],
			consumes: Swagger.consumes,
			produces: Swagger.produces,
			paths: paths
		})
	})
}
