const Response = require('express/lib/response.js')

export function ResponseExtension() {
	if (Response._grindHasExtended) {
		return
	}

	Response._grindHasExtended = true

	Response.route = function (name: string, parameters: any, secure: boolean) {
		if (this.app._grind.isNil) {
			throw new Error('Unsupported response object')
		}

		return this.redirect(this.app._grind.url.route(name, parameters, this.req, secure))
	}

	Response.flash = function (key: string, value: any) {
		this.req.flash(key, value)
		return this
	}

	Response.flashError = function (error: any) {
		this.req.flash('error', error)
		return this
	}

	Response.flashInput = function () {
		this.req.flash('_old_input', this.req.body)

		return this
	}
}

declare module 'express-serve-static-core' {
	interface Response {
		flash(key: string, value: any): void
		flashError(error: any): void
		flashInput(): void
		route(name: string, parameters: any, secure?: boolean): void
	}
}
