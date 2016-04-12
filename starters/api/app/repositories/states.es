class exports.StatesRepository

	constructor: (@db) ->

	all: (limit, offset, term, callback) ->
		if typeof term is 'function'
			callback = term
			term = null

		query = @db('states').orderBy('abbreviation', 'asc').limit(limit).offset(offset)
		query.where('name', 'like', '%' + term + '%').orWhere('abbreviation', 'like', '%' + term + '%') if term?
		query.after (err, rows) ->
			callback rows
			return

		return

	find: (abbreviation, callback) ->
		@db('states').where('abbreviation', abbreviation).limit(1).after (err, rows) ->
			if rows?.length > 0
				callback rows?[0]
			else
				callback null

			return

		return

