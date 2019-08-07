import '../BaseCommand'

const path = require('path')

export class RollbackCommand extends BaseCommand {

	name = 'migrate:rollback'
	description = 'Rollback the last set of migrations performed'

	run() {
		return this.db.migrate.rollback().spread((batchNo, log) => {
			if(log.length === 0) {
				this.warn('Already at the base migration')
				return
			}

			const s = log.length === 1 ? '' : 's'
			this.success(`Batch ${batchNo}; Rolled back ${log.length} migration${s}:`)

			for(const file of log) {
				this.success(`  - ${path.basename(file) }`)
			}
		})
	}

}
