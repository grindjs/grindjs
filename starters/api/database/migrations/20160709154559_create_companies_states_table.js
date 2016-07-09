export function up(knex) {
	return knex.schema.createTable('companies_states', table => {
		table.integer('company_id').unsigned().notNullable()
			.references('id').inTable('companies').onDelete('cascade')
		table.integer('state_id').unsigned().notNullable()
			.references('id').inTable('states').onDelete('cascade')
	})
}

export function down(knex) {
	return knex.schema.dropTable('companies_states')
}
