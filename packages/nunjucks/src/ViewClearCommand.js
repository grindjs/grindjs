import { Command } from 'grind-cli'
import { FS } from 'grind-support'

export class ViewClearCommand extends Command {
	name = 'view:clear'
	description = 'Clears precompiled view cache'

	async run() {
		if(await FS.exists(this.app.view.compiledViewPath)) {
			await FS.unlink(this.app.view.compiledViewPath)
		}

		Log.success('Done')
	}

}
