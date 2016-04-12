exports.up = (knex, Promise) ->
	return knex.schema.createTable 'states', (table) ->
		table.increments('id').primary()
		table.string('name', 64)
		table.string('abbreviation', 2).index()

exports.down = (knex, Promise) ->
	return knex.schema.dropTable 'states'
