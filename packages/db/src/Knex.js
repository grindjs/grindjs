import {group} from './group'

export function Knex() {
	var knex = require('knex')
	knex = knex.apply(module, arguments)

	// Alias `asCallback` to `after`
	knex.Promise.prototype.after = knex.Promise.prototype.asCallback
	knex.client.Raw.prototype.after = knex.client.Raw.prototype.asCallback
	knex.client.QueryBuilder.prototype.after = knex.client.QueryBuilder.prototype.asCallback

	// Add non-promise based grouped query support
	knex.group = function(callback) {
		return group(this, callback)
	}

	return knex
}
