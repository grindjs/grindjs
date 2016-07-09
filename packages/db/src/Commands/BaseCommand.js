import {Command} from 'grind-cli'

export class BaseCommand extends Command {
	db = null

	ready() {
		return super.ready().then(() => {
			this.db = this.app.get('db')
		})
	}

}
