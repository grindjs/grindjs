module.exports = (knex, callback) ->
	count = 0
	after = null

	next = ->
		after() if --count is 0
		return

	callback
		_inject: (obj) ->
			count++

			t = obj.then
			obj.then = (callback) ->
				if callback
					wrapped = ->
						callback.apply null, arguments
						next()
						return

					return t.apply @, [ wrapped ]
				else
					return t.apply @, arguments


			a = obj.asCallback
			obj.asCallback = (callback) ->
				wrapped = ->
					callback.apply null, arguments
					next()
					return

				return a.apply @, [ wrapped ]
			obj.after = obj.asCallback

		raw: (query) ->
			raw = knex.raw(query)
			@_inject raw
			return raw

		query: (tableName) ->
			builder = knex(tableName)
			@_inject builder
			return builder

		builder: ->
			builder = knex.queryBuilder()
			@_inject builder
			return builder

		# Called after all queries have executed
		after: (callback) ->
			after = callback
			return
