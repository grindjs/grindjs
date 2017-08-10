export function up(db) {
	return db.schema.createTable('user_avatars', table => {
		table.integer('id').unsigned().primary()
		table.integer('user_id').unsigned().nullable().index().references('id').inTable('users').onDelete('CASCADE')
		table.string('url', 128).notNullable().index()
		table.timestamps()
	})
}

export function down(db) {
	return db.schema.dropTable('user_avatars')
}
