export function seed(knex) {
	const table = 'companies'
	const now = knex.fn.now()

	return Promise.all([
		knex(table).del(),

		knex(table).insert([
			{
				id: 1,
				name: 'Apple',
				created_at: now,
				updated_at: now
			},
			{
				id: 2,
				name: 'Tesla',
				created_at: now,
				updated_at: now
			},
			{
				id: 3,
				name: 'Disney',
				created_at: now,
				updated_at: now
			}
		])
	])
}
