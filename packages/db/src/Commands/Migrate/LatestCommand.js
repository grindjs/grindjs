import '../BaseCommand'

const path = require('path')

export class LatestCommand extends BaseCommand {

	name = 'migrate:latest'
	description = 'Run all migrations that have not yet been run'

	run() {
		return this.db.migrate.latest().spread((batchNo, log) => {
			if(log.length === 0) {
				this.warn('Already up to date')
				return
			}

			const s = log.length === 1 ? '' : 's'
			this.success(`Batch ${batchNo}; Ran ${log.length} migration${s}:`)

			for(const file of log) {
				this.success(`  - ${path.basename(file)}`)
			}
		})
	}

}
