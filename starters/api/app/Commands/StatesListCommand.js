import {Command} from 'grind-cli'

import 'App/Models/StateModel'

export class StatesListCommand extends Command {
	// Name of the command
	name = 'states:list'

	// Description of the command to show in help
	description = 'List all states in the database'

	// Arguments available for this command
	arguments = [ 'term?' ]

	// Options for this command
	options = {
		limit: 'Limit the number of states'
	}

	run() {
		const limit = Number.parseInt(this.option('limit', 100))
		let query = null

		if(this.containsArgument('term')) {
			query = StateModel.find(this.argument('term'))
		} else {
			query = StateModel.query()
		}

		return query.limit(limit).then(rows => {
			for(const row of rows) {
				this.comment(row.name)
			}
		})
	}

}
