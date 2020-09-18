export function seed(db) {
	const table = 'companies'
	const now = db.fn.now()

	return Promise.all([
		db(table).del(),

		db(table).insert([
			{
				id: 1,
				name: 'Apple',
				created_at: now,
				updated_at: now,
			},
			{
				id: 2,
				name: 'Tesla',
				created_at: now,
				updated_at: now,
			},
			{
				id: 3,
				name: 'Disney',
				created_at: now,
				updated_at: now,
			},
		]),
	])
}
