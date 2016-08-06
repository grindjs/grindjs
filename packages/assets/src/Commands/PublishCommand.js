import './BaseCommand'
import '../Support/FS'

import crypto from 'crypto'
import path from 'path'

export class PublishCommand extends BaseCommand {
	name = 'assets:publish'
	description = 'Compies and publishes all assets'

	resourcesPath = null
	assetsPath = null
	publishPath = null
	assets = { }
	oldAssets = { }
	factory = null

	ready() {
		return super.ready().then(result => {
			this.factory = this.app.get('assets')
			return result
		})
	}

	async run() {
		this.resourcesPath = this.app.paths.base('resources')
		this.assetsPath = path.join(this.resourcesPath, 'assets')
		this.publishPath = this.app.paths.public()
		this.oldAssets = await this.loadOldAssets()

		if(this.oldAssets.isNil) {
			this.oldAssets = { }
		}

		await this.compile()

		await this.writeConfig(this.assets)
		await this.removeAssets(this.oldAssets)
	}

	async compile() {
		const assets = await this.findAssets(this.assetsPath)

		for(const asset of assets) {
			let content = null

			try {
				this.comment('Compiling', path.relative(this.app.paths.base(), asset.path))
				content = 'testing' // await asset.compile()
			} catch(err) {
				this.error(err.message || 'Unknown error')

				if(!err.file.isNil) {
					this.error(` --> File: ${err.file}`)
				}

				if(!err.line.isNil) {
					this.error(` --> Line: ${err.line}`)
				}

				if(!err.column.isNil) {
					this.error(` --> Column: ${err.column}`)
				}

				process.exit(1)
			}

			let storePath = path.relative(this.assetsPath, asset.path)
			storePath = path.join(asset.type, storePath.substr(storePath.indexOf('/')))

			let name = path.basename(storePath, path.extname(storePath))

			if(asset.compiler.wantsHashSuffixOnPublish) {
				const sha1 = crypto.createHash('md5')
				sha1.update(content)
				name += `-${sha1.digest('hex').substring(0, 8)}`
			}

			name += `.${asset.extension}`
			await this.storeAsset(asset, path.join(this.publishPath, path.dirname(storePath), name), content)
		}
	}

	findAssets(pathname) {
		return FS.recursiveReaddir(pathname).then(files => files.filter(file => {
			const first = path.basename(file).substring(0, 1)

			if(first === '_' || first === '.') {
				return false
			}

			if(!this.factory.isPathSupported(file)) {
				this.comment('Skipping unsupported asset', path.relative(this.app.paths.base(), file))
				return false
			}

			return true
		}).map(file => this.factory.make(file)))
	}

	loadOldAssets() {
		return this.app.config.get('assets-published')
	}

	async storeAsset(asset, file, contents) {
		await FS.mkdirp(path.dirname(file))
		await FS.writeFile(file, contents)
		const lastModified = await asset.lastModified()

		if(!lastModified.isNil) {
			await FS.touch(file, lastModified)
		}

		const src = path.relative(this.resourcesPath, asset.path)
		const dest = path.relative(this.publishPath, file)
		this.assets[src] = dest

		if(this.oldAssets[src] === dest) {
			delete this.oldAssets[src]
		}
	}

	async removeAssets(assets) {
		for(const key of Object.keys(assets)) {
			await this.removeAsset(assets[key])
		}
	}

	async writeConfig(config) {
		await FS.writeFile(
			this.app.paths.config('assets-published.json'),
			JSON.stringify(config, null, ' ')
		)
	}

}
