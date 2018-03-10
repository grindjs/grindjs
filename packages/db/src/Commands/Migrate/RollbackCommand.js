import '../BaseCommand'

import path from 'path'

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

			const absolute = this.db.migrate._absoluteConfigDir()

			for(const file of log) {
				this.success(`  - ${path.relative(absolute, file) }`)
			}
		})
	}

}
