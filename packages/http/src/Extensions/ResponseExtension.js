import { response as Response } from 'express'

let hasExtended = false

export function ResponseExtension() {
	if(hasExtended) {
		return
	}

	hasExtended = true

	Response.route = function(name, parameters, secure) {
		if(this.app._grind.isNil) {
			throw new Error('Unsupported response object')
		}

		return this.redirect(this.app._grind.url.route(name, parameters, this.req, secure))
	}

}
