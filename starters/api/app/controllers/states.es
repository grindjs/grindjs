class exports.StatesController extends resolve('./base')

	constructor: (@app) ->
		super @app
		@repo = make '../repositories/states', @db

	index: (req, res) ->
		[ limit, offset ] = @pagination req

		@repo.all limit, offset, (rows) ->
			res.send rows
			return

		return

	show: (req, res) ->
		[ limit, offset ] = @pagination req

		@repo.find req.params.abbr.toUpperCase(), (row) =>
			if row
				res.send row
			else
				@sendError res, 404, 'State not found'

			return

		return

	search: (req, res) ->
		if not req.query.term or req.query.term.length is 0
			@sendError res, 400, '`term` is required'
			return

		[ limit, offset ] = @pagination req

		@repo.all limit, offset, req.query.term, (rows) =>
			if rows?.length > 0
				res.send rows
			else
				@sendError res, 404, 'No states found, try a different term'

			return

		return
