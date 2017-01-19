export function HttpsMiddleware(app) {
	if(app.env() !== 'production') {
		return (req, res, next) => next()
	}

	return (req, res, next) => {
		if(req.secure) {
			return next()
		}

		return res.redirect(app.url.make(req._parsedUrl.pathname, req.query, req, true))
	}
}
