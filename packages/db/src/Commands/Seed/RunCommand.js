import '../BaseCommand'

const path = require('path')

export class RunCommand extends BaseCommand {

	name = 'db:seed'
	description = 'Seed the database'

	async run() {
		const [ log ] = await this.db.seed.run()

		if(log.length === 0) {
			this.warn('No seed files exist')
			return
		}

		const s = log.length === 1 ? '' : 's'
		this.success(`Ran ${log.length} seed file${s}:`)

		for(const file of log) {
			this.success(`  - ${path.basename(file) }`)
		}
	}

}
