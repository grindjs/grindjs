export function ValidationErrorHandler(err, req, res) {
	if(req.xhr || ((req.headers || { }).accept || '').toString().indexOf('json') >= 0) {
		const violators = Object.keys(err.errors || { })

		return {
			code: err.statusCode || 400,
			error: violators.length === 1 ? err.errors[violators][0].message : 'Validation error',
			violations: err.errors
		}
	}

	const backTo = ((req.headers || { }).referer || '').toString()

	if(backTo.length === 0) {
		return {
			code: 400
		}
	}

	if(typeof res.flash === 'function') {
		res.flash('errors', err.errors)
		res.flashInput()
	} else if(typeof req.flash === 'function') {
		req.flash('errors', err.errors)
		req.flashInput()
	}

	res.redirect(backTo)
}
