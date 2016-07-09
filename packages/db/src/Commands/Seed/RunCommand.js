import '../BaseCommand'

export class RunCommand extends BaseCommand {
	name = 'db:seed'
	description = 'Seed the database'

	run() {
		return this.db.seed.run().spread(log => {
			if(log.length === 0) {
				this.warn('No seed files exist')
				return
			}

			this.success(`Ran ${log.length} seed files:`)

			const cwd = process.cwd().replace(/\/$/, '') + '/'
			for(const file of log) {
				this.success(`  - ${file.replace(cwd, '') }`)
			}
		})
	}

}
