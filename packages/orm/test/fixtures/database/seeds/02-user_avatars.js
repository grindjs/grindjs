export async function seed(db) {
	await db('user_avatars').del()

	await db('user_avatars').insert({
		id: 1,
		user_id: 1,
		url: 'https://grind.rocks/img/logo.svg',
		created_at: db.fn.now(),
		updated_at: db.fn.now()
	})
}
