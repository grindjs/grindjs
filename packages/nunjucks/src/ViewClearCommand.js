import { Command } from 'grind-cli'
import { FS } from 'grind-support'

export class ViewClearCommand extends Command {
	name = 'view:clear'
	description = 'Clears precompiled view cache'

	async run() {
		const exists = FS.exists(this.app.view.compiledViewPath)

		if(exists) {
			await FS.unlink(this.app.view.compiledViewPath)
		}

		Log.success('Done')
	}

}
