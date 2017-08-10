export async function seed(db) {
	await db('users').del()

	await db('users').insert({
		id: 1,
		name: 'Grind',
		created_at: db.fn.now(),
		updated_at: db.fn.now()
	})

	await db('users').insert({
		id: 2,
		name: 'ORM',
		created_at: db.fn.now(),
		updated_at: db.fn.now()
	})
}
