export function seed(knex) {
	const table = 'companies_states'

	return Promise.all([
		// Deletes ALL existing entries
		knex(table).del(),

		// Inserts seed entries
		knex(table).insert([
			// Apple
			{ company_id: 1, state_id: 5 },
			{ company_id: 1, state_id: 32 },
			{ company_id: 1, state_id: 33 },
			{ company_id: 1, state_id: 47 },

			// Tesla
			{ company_id: 2, state_id: 5 },

			// Disney
			{ company_id: 3, state_id: 5 },
			{ company_id: 3, state_id: 9 }
		])
	])
}
