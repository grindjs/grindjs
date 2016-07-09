import '../BaseCommand'

export class LatestCommand extends BaseCommand {
	name = 'migrate:latest'
	description = 'Run all migrations that have not yet been run'

	run() {
		return this.db.migrate.latest().spread((batchNo, log) => {
			if(log.length === 0) {
				this.warn('Already up to date')
				return
			}

			this.success(`Batch ${batchNo}; Ran ${log.length} migrations:`)

			const cwd = process.cwd().replace(/\/$/, '') + '/'
			for(const file of log) {
				this.success(`  - ${file.replace(cwd, '') }`)
			}
		})
	}

}
