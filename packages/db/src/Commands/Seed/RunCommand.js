import '../BaseCommand'

const path = require('path')

export class RunCommand extends BaseCommand {

	name = 'db:seed'
	description = 'Seed the database'

	run() {
		return this.db.seed.run().spread(log => {
			if(log.length === 0) {
				this.warn('No seed files exist')
				return
			}

			const s = log.length === 1 ? '' : 's'
			this.success(`Ran ${log.length} seed file${s}:`)

			for(const file of log) {
				this.success(`  - ${path.basename(file) }`)
			}
		})
	}

}
