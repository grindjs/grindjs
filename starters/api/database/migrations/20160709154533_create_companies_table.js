export function up(knex) {
	return knex.schema.createTable('companies', table => {
		table.increments('id').unsigned().primary()
		table.string('name', 255)
		table.timestamps()
	})
}

export function down(knex) {
	return knex.schema.dropTable('companies')
}
