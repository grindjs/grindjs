import { Command } from '@grindjs/cli'

export class ViewClearCommand extends Command {
	name = 'view:clear'
	description = 'Clears precompiled view cache'

	async run() {
		await this.app.view?.engine.clearCache()

		Log.success('Done')
	}
}
