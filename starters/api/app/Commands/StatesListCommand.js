import { Command, InputArgument, InputOption } from 'grind-cli'

import 'App/Models/StateModel'

export class StatesListCommand extends Command {
	// Name of the command
	name = 'states:list'

	// Description of the command to show in help
	description = 'List all states in the database'

	// Arguments available for this command
	arguments = [new InputArgument('term', InputArgument.VALUE_OPTIONAL, 'Search term')]

	// Options for this command
	options = [
		new InputOption('limit', InputOption.VALUE_OPTIONAL, 'Limit the number of states', '100'),
	]

	run() {
		const limit = Number.parseInt(this.option('limit', 100))
		let query = null

		if (this.containsArgument('term')) {
			query = StateModel.find(this.argument('term'))
		} else {
			query = StateModel.query()
		}

		return query.limit(limit).then(rows => {
			for (const row of rows) {
				this.comment(row.name)
			}
		})
	}
}
