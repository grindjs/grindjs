const Request = require('express/lib/request.js')

export function RequestExtension() {
	if(Request._grindHasExtended) {
		return
	}

	Request._grindHasExtended = true

	Request.flashInput = function() {
		this.flash('_old_input', this.body)
		return this
	}
}
