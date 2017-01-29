import { Command } from 'grind-cli'
import { FS } from 'grind-support'

export class BaseCommand extends Command {

	async removeAsset(asset) {
		const path = this.app.paths.public(asset)
		const mapPath = `${path}.map`

		const hasMap = await FS.exists(mapPath)
		const promises = [ FS.unlink(path) ]

		if(hasMap) {
			promises.push(FS.unlink(mapPath))
		}

		return Promise.all(promises).catch(err => {
			Log.comment('Unable to remove', asset, err.message)
		})
	}

}
