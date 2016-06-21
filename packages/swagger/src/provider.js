import path from 'path'
import findRoot from 'find-root'
import {compileRoute} from './compile-route'

export function provider(app) {

	app.use((req, res, next) => {
		res.setHeader('Access-Control-Allow-Origin', '*')
		next()
	})

	app.get('/swagger.json', (req, res) => {
		const router = app._router
		const stack = router ? router.stack : null

		if(router.isNil || router.length <= 0) {
			res.status(400).send({
				error: 'No defined routes'
			})

			return
		}

		const rootPath = findRoot(path.dirname(require.main.filename))
		const info = require(path.join(rootPath, 'package.json'))

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
