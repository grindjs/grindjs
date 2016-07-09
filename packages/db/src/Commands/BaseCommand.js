import {Command} from '../../../cli/src'

export class BaseCommand extends Command {
	db = null

	ready() {
		return super.ready().then(() => {
			this.db = this.app.get('db')
		})
	}

}
