import { Command } from 'grind-cli'

export class BaseCommand extends Command {

	db = null

	async ready() {
		await super.ready()

		this.db = this.app.db
	}

}
