import '../BaseCommand'

export class RollbackCommand extends BaseCommand {
	name = 'migrate:rollback'
	description = 'Rollback the last set of migrations performed'

	run() {
		return this.db.migrate.rollback().spread((batchNo, log) => {
			if(log.length === 0) {
				Log.warn('Already at the base migration')
				return
			}

			Log.success(`Batch ${batchNo} rolled back: ${log.length} migrations`)
		})
	}

}
