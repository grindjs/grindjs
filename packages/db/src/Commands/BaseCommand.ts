import { Command } from '@grindjs/cli'
import knex from 'knex'

export class BaseCommand extends Command {
	db?: knex

	async ready() {
		await super.ready()

		this.db = this.app.db
	}
}
