export function seed(knex) {
	const table = 'countries'

	return Promise.all([
		knex(table).del(),

		knex(table).insert({ id: 1, abbreviation: 'US', name: 'United States' })
	])
}
