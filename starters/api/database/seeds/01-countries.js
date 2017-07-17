export function seed(db) {
	const table = 'countries'

	return Promise.all([
		db(table).del(),

		db(table).insert({ id: 1, abbreviation: 'US', name: 'United States' })
	])
}
