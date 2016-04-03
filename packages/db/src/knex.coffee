group = require './group'

module.exports = ->
	knex = require 'knex'
	knex = knex.apply module, arguments

	# Alias `asCallback` to `after`
	knex.Promise::after = knex.Promise::asCallback
	knex.client.Raw::after = knex.client.Raw::asCallback
	knex.client.QueryBuilder::after = knex.client.QueryBuilder::asCallback

	# Add non-promise based grouped query support
	knex.group = (callback) ->
		return group this, callback

	return knex
