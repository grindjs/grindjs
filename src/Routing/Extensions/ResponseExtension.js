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

	Response.flashInput = function() {
		if(typeof this.req.flash === 'function') {
			this.req.flash('_old_input', this.req.body)
		} else {
			this.flash('_old_input', this.req.body)
		}

		return this
	}

}
