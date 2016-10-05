import $url from 'url'

export class UrlGenerator {
	app = null
	defaultUrl = null

	constructor(app) {
		this.app = app

		let defaultUrl = null

		if(this.app.port === 443) {
			defaultUrl = 'https://localhost'
		} else if(this.app.port === 80) {
			defaultUrl = 'http://localhost'
		} else {
			defaultUrl = `http://localhost:${this.app.port}`
		}

		this.defaultUrl = $url.parse(app.config.get('app.url', defaultUrl))

		if(!this.defaultUrl.path.isNil && this.defaultUrl.path !== '' && this.defaultUrl.path !== '/') {
			throw new Error('`app.url` can not contain a path.')
		}
	}

	route(name, parameters, req, secure = null) {
		const route = this.app.routes.namedRoutes[name]

		if(route.isNil) {
			throw new Error(`Undefined route name: ${name}`)
		}

		if(!Array.isArray(parameters)) {
			parameters = [ parameters ]
		}

		const numberOfParameters = parameters.length
		let isObject = false

		if(numberOfParameters === 1 && typeof parameters[0] === 'object') {
			isObject = true
			parameters = parameters[0]
		}

		let index = 0
		const path = route.path.replace(/:([a-z0-0_\-\.]+)(?:\(([^\)]+)\))?(\?)?/g, (_, name) => {
			if(isObject) {
				const value = parameters[name] || ''
				delete parameters[name]
				return value
			}

			if(numberOfParameters < index) {
				return ''
			}

			return parameters[index++]
		})

		if(!isObject) {
			parameters = null
		}

		return this.make({
			pathname: path,
			query: { }
		}, parameters, req, secure)
	}

	make(url, parameters, req, secure = null) {
		if(typeof url === 'string') {
			if(url.indexOf('://') >= 0) {
				return url
			}

			url = { pathname: url }
		}

		if(!parameters.isNil) {
			if(url.query.isNil) {
				url.query = parameters
			} else {
				url.query = Object.assign({ }, url.query, parameters)
			}
		}

		if(!req.isNil) {
			url.protocol = req.protocol
			url.host = req.get('Host')
		} else {
			url = Object.assign({ }, this.defaultUrl, url)
		}

		if(secure === true) {
			url.protocol = 'https'
		} else if(secure === false) {
			url.protocol = 'http'
		}

		return $url.format(url)
	}

}
