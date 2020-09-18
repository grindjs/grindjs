export function seed(db) {
	const table = 'states'
	let id = 1

	return Promise.all([
		db(table).del(),

		// `id` is autoincrement and not generally necessary to explicitly define
		// However, for the `company_state` seed, having a consistent `id` to
		// reference makes things easier.

		db(table).insert({ id: id++, abbreviation: 'AL', name: 'Alabama', country_id: 1 }),
		db(table).insert({ id: id++, abbreviation: 'AK', name: 'Alaska', country_id: 1 }),
		db(table).insert({ id: id++, abbreviation: 'AZ', name: 'Arizona', country_id: 1 }),
		db(table).insert({ id: id++, abbreviation: 'AR', name: 'Arkansas', country_id: 1 }),
		db(table).insert({ id: id++, abbreviation: 'CA', name: 'California', country_id: 1 }),
		db(table).insert({ id: id++, abbreviation: 'CO', name: 'Colorado', country_id: 1 }),
		db(table).insert({ id: id++, abbreviation: 'CT', name: 'Connecticut', country_id: 1 }),
		db(table).insert({ id: id++, abbreviation: 'DE', name: 'Delaware', country_id: 1 }),
		db(table).insert({ id: id++, abbreviation: 'FL', name: 'Florida', country_id: 1 }),
		db(table).insert({ id: id++, abbreviation: 'GA', name: 'Georgia', country_id: 1 }),
		db(table).insert({ id: id++, abbreviation: 'HI', name: 'Hawaii', country_id: 1 }),
		db(table).insert({ id: id++, abbreviation: 'ID', name: 'Idaho', country_id: 1 }),
		db(table).insert({ id: id++, abbreviation: 'IL', name: 'Illinois', country_id: 1 }),
		db(table).insert({ id: id++, abbreviation: 'IN', name: 'Indiana', country_id: 1 }),
		db(table).insert({ id: id++, abbreviation: 'IA', name: 'Iowa', country_id: 1 }),
		db(table).insert({ id: id++, abbreviation: 'KS', name: 'Kansas', country_id: 1 }),
		db(table).insert({ id: id++, abbreviation: 'KY', name: 'Kentucky', country_id: 1 }),
		db(table).insert({ id: id++, abbreviation: 'LA', name: 'Louisiana', country_id: 1 }),
		db(table).insert({ id: id++, abbreviation: 'ME', name: 'Maine', country_id: 1 }),
		db(table).insert({ id: id++, abbreviation: 'MD', name: 'Maryland', country_id: 1 }),
		db(table).insert({ id: id++, abbreviation: 'MA', name: 'Massachusetts', country_id: 1 }),
		db(table).insert({ id: id++, abbreviation: 'MI', name: 'Michigan', country_id: 1 }),
		db(table).insert({ id: id++, abbreviation: 'MN', name: 'Minnesota', country_id: 1 }),
		db(table).insert({ id: id++, abbreviation: 'MS', name: 'Mississippi', country_id: 1 }),
		db(table).insert({ id: id++, abbreviation: 'MO', name: 'Missouri', country_id: 1 }),
		db(table).insert({ id: id++, abbreviation: 'MT', name: 'Montana', country_id: 1 }),
		db(table).insert({ id: id++, abbreviation: 'NE', name: 'Nebraska', country_id: 1 }),
		db(table).insert({ id: id++, abbreviation: 'NV', name: 'Nevada', country_id: 1 }),
		db(table).insert({ id: id++, abbreviation: 'NH', name: 'New Hampshire', country_id: 1 }),
		db(table).insert({ id: id++, abbreviation: 'NJ', name: 'New Jersey', country_id: 1 }),
		db(table).insert({ id: id++, abbreviation: 'NM', name: 'New Mexico', country_id: 1 }),
		db(table).insert({ id: id++, abbreviation: 'NY', name: 'New York', country_id: 1 }),
		db(table).insert({ id: id++, abbreviation: 'NC', name: 'North Carolina', country_id: 1 }),
		db(table).insert({ id: id++, abbreviation: 'ND', name: 'North Dakota', country_id: 1 }),
		db(table).insert({ id: id++, abbreviation: 'OH', name: 'Ohio', country_id: 1 }),
		db(table).insert({ id: id++, abbreviation: 'OK', name: 'Oklahoma', country_id: 1 }),
		db(table).insert({ id: id++, abbreviation: 'OR', name: 'Oregon', country_id: 1 }),
		db(table).insert({ id: id++, abbreviation: 'PA', name: 'Pennsylvania', country_id: 1 }),
		db(table).insert({ id: id++, abbreviation: 'RI', name: 'Rhode Island', country_id: 1 }),
		db(table).insert({ id: id++, abbreviation: 'SC', name: 'South Carolina', country_id: 1 }),
		db(table).insert({ id: id++, abbreviation: 'SD', name: 'South Dakota', country_id: 1 }),
		db(table).insert({ id: id++, abbreviation: 'TN', name: 'Tennessee', country_id: 1 }),
		db(table).insert({ id: id++, abbreviation: 'TX', name: 'Texas', country_id: 1 }),
		db(table).insert({ id: id++, abbreviation: 'UT', name: 'Utah', country_id: 1 }),
		db(table).insert({ id: id++, abbreviation: 'VT', name: 'Vermont', country_id: 1 }),
		db(table).insert({ id: id++, abbreviation: 'VA', name: 'Virginia', country_id: 1 }),
		db(table).insert({ id: id++, abbreviation: 'WA', name: 'Washington', country_id: 1 }),
		db(table).insert({ id: id++, abbreviation: 'WV', name: 'West Virginia', country_id: 1 }),
		db(table).insert({ id: id++, abbreviation: 'WI', name: 'Wisconsin', country_id: 1 }),
		db(table).insert({ id: id++, abbreviation: 'WY', name: 'Wyoming', country_id: 1 }),
		db(table).insert({ id: id++, abbreviation: 'DC', name: 'Washington DC', country_id: 1 }),
	])
}
