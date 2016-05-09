export function ErrorHandlerProvider(app) {
	const isProduction = app.env === 'production'

	app.use((err, req, res, next) => {
		console.error(err.stack)

		if(res.headersSent) {
			return next(err)
		}

		var json = { }

		if(err instanceof HttpError) {
			json.code = err.status || 500
			json.error = err.message
		} else {
			json.code = err.status || 500
			json.error = 'Internal server error'

			if(!isProduction) {
				json.error = err.message || json.error
			}
		}

		if(!isProduction) {
			json.stack = err.stack.split(/\n+/)
		}

		res.status(json.code).send(json)
	})

}
