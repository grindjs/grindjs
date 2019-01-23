import './BaseCommand'

import { FS } from 'grind-support'
import { InputOption } from 'grind-cli'

const crypto = require('crypto')
const path = require('path')
const Ignore = require('ignore')

export class PublishCommand extends BaseCommand {

	name = 'assets:publish'
	description = 'Compies and publishes all assets'

	assets = { }
	oldAssets = { }
	factory = null
	publishedBaseUrl = null
	topLevel = false

	options = [
		new InputOption('published-base-url', InputOption.VALUE_OPTIONAL, 'Specify the base URL for published assets.'),
	]

	ready() {
		this.factory = this.app.assets
		this.topLevel = this.app.config.get('assets.top_level') === true

		return super.ready()
	}

	async run() {
		this.oldAssets = await this.loadOldAssets()

		if(this.oldAssets.isNil) {
			this.oldAssets = { }
		}

		if(this.containsOption('published-base-url')) {
			this.publishedBaseUrl = this.option('published-base-url').replace(/\/$/g, '')
			this.assets.__base_url = `${this.publishedBaseUrl}/`
		} else {
			this.publishedBaseUrl = path.join('/', path.relative(this.app.paths.public('/'), this.publishPath))
		}

		if(!this.oldAssets.__base_url.isNil) {
			const length = this.oldAssets.__base_url.length
			delete this.oldAssets.__base_url

			for(const key of Object.keys(this.oldAssets)) {
				this.oldAssets[key] = this.oldAssets[key].substring(length)
			}
		}

		await this.compile()

		await this.writeConfig(this.assets)
		await this.removeAssets(this.oldAssets)
	}

	async compile() {
		const assets = await this.findAssets(this.sourcePath)

		for(const asset of assets) {
			let content = null

			try {
				this.comment('Compiling', path.relative(this.app.paths.base(), asset.path))
				content = await asset.compile()
			} catch(err) {
				let message = err.message || 'Unknown error'

				if(!err.file.isNil) {
					message += `\n --> File: ${err.file}`
				}

				if(!err.line.isNil) {
					message += `\n --> Line: ${err.line}`
				}

				if(!err.column.isNil) {
					message += `\n --> Column: ${err.column}`
				}

				throw new Error(message)
			}

			let storePath = path.relative(this.sourcePath, asset.path)

			if(!this.topLevel) {
				storePath = path.join(asset.type, storePath.substr(storePath.indexOf('/')))
			}

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

	async findAssets(pathname) {
		const files = await FS.recursiveReaddir(pathname)
		const ignoreFiles = files.filter(file => path.basename(file) === '.assetsignore')
		const ignoreRules = Ignore().add([ '**/_*', '**/.*', path.join(path.relative(this.sourcePath, this.publishPath), '/') ])

		for(const ignoreFile of ignoreFiles) {
			const content = await FS.readFile(ignoreFile).then(content => content.toString())
			const dirname = path.relative(pathname, path.dirname(ignoreFile))

			const rules = content.split(/[\n\r]+/).filter(line => {
				line = line.trim()
				return line.length > 0 && line.substring(0, 1) !== '#'
			}).map(line => {
				if(line.substring(0, 1) === '!') {
					return `!${path.join(dirname, line.substring(1))}`
				}

				return path.join(dirname, line)
			})

			ignoreRules.add(rules)
		}

		return files.filter(file => {
			if(ignoreRules.filter([ path.relative(pathname, file) ]).length !== 1) {
				return false
			}

			if(!this.factory.isPathSupported(file)) {
				this.comment('Skipping unsupported asset', path.relative(this.app.paths.base(), file))
				return false
			}

			return true
		}).map(file => this.factory.make(file))
	}

	loadOldAssets() {
		return this.app.config.get('assets-published')
	}

	async storeAsset(asset, file, contents) {
		await FS.mkdirp(path.dirname(file))

		if(!(contents instanceof Buffer)) {
			contents = Buffer.from(contents)
		}

		contents = await this.postProcess(asset, file, contents)

		await FS.writeFile(file, contents)
		const lastModified = await asset.lastModified()

		if(!lastModified.isNil) {
			await FS.touch(file, lastModified)
		}

		const src = path.relative(this.sourcePath, asset.path)
		let dest = path.relative(this.publishPath, file)

		if(this.publishedBaseUrl !== null) {
			dest = `${this.publishedBaseUrl}/${dest}`
		}

		this.assets[src] = dest

		if(this.oldAssets[src] === dest) {
			delete this.oldAssets[src]
		}
	}

	async postProcess(asset, file, contents) {
		const postProcessors = this.factory.getPostProcessorsFromPath(file)

		if(postProcessors.length === 0) {
			return contents
		}

		for(const postProcessor of postProcessors) {
			this.comment(`Applying ${postProcessor.constructor.name}`, path.relative(this.app.paths.base(), asset.path))
			contents = await postProcessor.process(asset.path, file, contents)

			if(!(contents instanceof Buffer)) {
				contents = Buffer.from(contents)
			}
		}

		return contents
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
