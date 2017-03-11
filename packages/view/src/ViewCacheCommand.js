import { Command } from 'grind-cli'

export class ViewCacheCommand extends Command {
	name = 'view:cache'
	description = 'Precompiles and caches all views'

	async run() {
		await this.app.view.engine.writeCache()
		Log.success('Done')
	}

}
