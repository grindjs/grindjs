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

	Response.flash = function(key, value) {
		this.req.flash(key, value)
		return this
	}

	Response.flashError = function(error) {
		this.req.flash('error', error)
		return this
	}

	Response.flashInput = function() {
		this.req.flash('_old_input', this.req.body)

		return this
	}
}
