import { Command } from 'grind-cli'

import '../Support/FS'

export class BaseCommand extends Command {

	removeAsset(asset) {
		return FS.unlink(this.app.paths.public(asset)).catch(err => {
			Log.comment('Unable to remove', asset, err.message)
		})
	}

}
