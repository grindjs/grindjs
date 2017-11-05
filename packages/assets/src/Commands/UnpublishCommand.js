import './BaseCommand'

import { FS } from 'grind-support'
const path = require('path')

export class UnpublishCommand extends BaseCommand {

	name = 'assets:unpublish'
	description = 'Removes published assets'

	async run() {
		await this.removePublishedAssets()
		await this.removeConfig()
	}

	async removePublishedAssets() {
		const dirs = [ ]
		const published = this.app.config.get('assets-published', { })

		if(!published.__base_url.isNil) {
			const length = published.__base_url.length
			delete published.__base_url

			for(const key of Object.keys(published)) {
				published[key] = published[key].substring(length)
			}
		}

		for(const key of Object.keys(published)) {
			const asset = published[key]

			this.comment('Removing asset', asset)
			dirs.push(path.dirname(asset))
			await this.removeAsset(asset)
		}

		await this.removeEmptyDirectories(dirs)
	}

	async removeEmptyDirectories(dirs) {
		dirs.sort((a, b) => a.length > b.length ? -1 : 1)

		for(const dir of dirs) {
			const path = this.app.paths.public(dir)
			const exists = await FS.exists(path)

			if(!exists) {
				continue
			}

			try {
				await FS.rmdir(path)
			} catch(err) {
				Log.error('Failed to delete directory', dir, err)
			}
		}
	}

	removeConfig() {
		const path = this.app.paths.config('assets-published.json')

		return FS.exists(path).then(exists => {
			if(!exists) {
				return
			}

			return FS.unlink(path)
		})
	}

}
