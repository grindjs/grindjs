export function Knex() {
	var knex = require('knex')
	knex = knex.apply(module, arguments)

	// Alias `asCallback` to `after`
	knex.Promise.prototype.after = knex.Promise.prototype.asCallback
	knex.client.Raw.prototype.after = knex.client.Raw.prototype.asCallback
	knex.client.QueryBuilder.prototype.after = knex.client.QueryBuilder.prototype.asCallback

	return knex
}
