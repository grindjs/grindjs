const Response = require('express/lib/response.js')

export function ResponseExtension() {
	if(Response._grindHasExtended) {
		return
	}

	Response._grindHasExtended = true

	Response.route = function(name, parameters, secure) {
		if(this.app._grind.isNil) {
			throw new Error('Unsupported response object')
		}

		return this.redirect(this.app._grind.url.route(name, parameters, this.req, secure))
	}

}
