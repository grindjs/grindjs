class exports.BaseController
	app: null
	db: null

	constructor: (@app) ->
		@db = @app.get 'db'
		return

	pagination: (req, limit = 100) ->
		limit = Math.min(Math.max(parseInt(req.query.limit or limit), 1), limit)
		offset = Math.max(parseInt(req.query.offset or 0), 0)

		return [ limit, offset ]

	sendError: (res, code, message) ->
		res.status code
		res.send
			error: message
			code: code

		return
