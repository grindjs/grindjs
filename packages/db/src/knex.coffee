module.exports = ->
	knex = require 'knex'
	knex = knex.apply module, arguments

	# Alias `asCallback` to `after`
	knex.Promise::after = knex.Promise::asCallback
	knex.client.Raw::after = knex.client.Raw::asCallback
	knex.client.QueryBuilder::after = knex.client.QueryBuilder::asCallback

	# Add non-promise based grouped query support
	knex.group = (callback) ->
		count = 0
		after = null

		next = ->
			after() if --count is 0
			return

		callback
			query: ->
				count++
				builder = knex.apply knex, arguments

				t = builder.then
				builder.then = (callback) ->
					if callback
						throw new Error 'Promises are not supported in grouped queries.'
					else
						return t.apply @, arguments


				a = builder.asCallback
				builder.asCallback = (callback) ->
					wrapped = (err, rows) ->
						callback(err, rows)
						next()
						return

					return a.apply @, [ wrapped ]
				builder.after = builder.asCallback

				return builder

			after: (callback) ->
				after = callback
				return

		return

	return knex
