export function seed(db) {
	const table = 'companies_states'

	return Promise.all([
		// Deletes ALL existing entries
		db(table).del(),

		// Inserts seed entries
		db(table).insert([
			// Apple
			{ company_id: 1, state_id: 5 },
			{ company_id: 1, state_id: 32 },
			{ company_id: 1, state_id: 33 },
			{ company_id: 1, state_id: 47 },

			// Tesla
			{ company_id: 2, state_id: 5 },

			// Disney
			{ company_id: 3, state_id: 5 },
			{ company_id: 3, state_id: 9 },
		]),
	])
}
