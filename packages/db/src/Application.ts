import knex from 'knex'

declare module '@grindjs/framework' {
	interface Application {
		db?: knex
	}
}
