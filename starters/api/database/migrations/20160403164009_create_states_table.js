export function up(knex) {
	return knex.schema.createTable('states', table => {
		table.increments('id').primary()
		table.string('name', 64)
		table.string('abbreviation', 2).index()
	})
}

export function down(knex) {
	return knex.schema.dropTable('states')
}
