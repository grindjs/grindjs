import { Command } from 'grind-cli'
import { FS } from 'grind-support'

const path = require('path')

export class BaseCommand extends Command {

	sourcePath = null
	publishPath = null

	ready() {
		this.sourcePath = this.app.paths.base(this.app.config.get('assets.paths.source'))
		this.publishPath = this.app.paths.base(this.app.config.get('assets.paths.publish'))

		return super.ready()
	}

	async removeAsset(asset) {
		const assetPath = path.join(this.sourcePath, asset)
		const mapPath = `${assetPath}.map`

		const hasMap = await FS.exists(mapPath)
		const promises = [ FS.unlink(assetPath) ]

		if(hasMap) {
			promises.push(FS.unlink(mapPath))
		}

		try {
			return await Promise.all(promises)
		} catch(err) {
			Log.comment('Unable to remove', asset, err.message)
		}
	}

}
