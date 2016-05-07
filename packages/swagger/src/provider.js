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

			routePath = routePath.replace(/:([a-z0-0_\-\.]+)/, '{$1}')
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
