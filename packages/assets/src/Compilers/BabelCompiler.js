import './Compiler'

import './BabelCompiler/BrowserifyStage'
import './BabelCompiler/RollupStage'

import { FS } from 'grind-support'

const path = require('path')
const { Readable } = require('stream')

export class BabelCompiler extends Compiler {

	static stages = [
		RollupStage,
		BrowserifyStage
	]

	wantsHashSuffixOnPublish = true
	supportedExtensions = [ 'js', 'jsx', 'es', 'es6', 'es7', 'esx' ]
	priority = 1000
	stages = null

	constructor(app, ...args) {
		super(app, ...args)

		const stages = [ ]

		for(const stage of this.constructor.stages) {
			stages.push(new stage(this.sourceMaps, app.config.get(`assets.compilers.babel.${stage.configName}`, { })))
		}

		this.stages = stages.filter(({ enabled }) => enabled)

		if(this.stages.length === 0) {
			throw new Error('Invalid assets config: at least one stage must be enabled.')
		}
	}

	supports(pathname) {
		if(!super.supports(pathname)) {
			return false
		}

		return pathname.includes('babel') || pathname.includes('LiveReload')
	}

	async compile(pathname) {
		const imports = await this.getLiveReloadImports(pathname)
		let contents = null

		for(const stage of this.stages) {
			stage.handleBabel = contents.isNil
			let stream = null

			if(!stage.handleBabel) {
				stream = new Readable
				stream.push(contents)
				stream.push(null)
			}

			contents = await stage.compile(pathname, stream)
		}

		if(!this.liveReload || imports.length === 0) {
			return contents
		}

		const resources = this.app.paths.base('resources')
		if(pathname.startsWith(resources)) {
			pathname = pathname.substring(resources.length)
		}

		contents = contents.toString()
		contents += '// LIVE_RELOAD_START\n'
		contents += 'window.__liveReloadImports = window.__liveReloadImports || { }\n'
		contents += `window.__liveReloadImports['${pathname}'] = ${JSON.stringify(imports)}\n`
		contents += '// LIVE_RELOAD_END\n'
		return contents
	}

	async enumerateImports(pathname, callback) {
		const exists = await FS.exists(pathname)

		if(!exists) {
			return
		}

		const contents = await FS.readFile(pathname)
		const importPaths = [ ]

		contents.toString().replace(/import\s*\{[^}]+\}\s*from\s*((["'`]).+?(\2))/igm, (_, importPath) => {
			importPaths.push(importPath)
		})

		contents.toString().replace(/import\s*((["'`]).+?(\2))/ig, (_, importPath) => {
			importPaths.push(importPath)
		})

		contents.toString().replace(/require\s*\(([^)]+)\)/ig, (_, importPath) => {
			importPaths.push(importPath)
		})

		for(let importPath of importPaths) {
			const dirname = path.dirname(pathname)
			importPath = path.join(dirname, importPath.replace(/["'`]/g, '').trim())

			const ext = path.extname(importPath).substring(1)
			const files = [ ]

			if(ext.indexOf(this.supportedExtensions) === -1) {
				for(const ext of this.supportedExtensions) {
					files.push(`${importPath}.${ext}`)
				}
			} else {
				files.push(importPath)
			}

			for(const file of files) {
				const exists = await FS.exists(file)

				if(!exists) {
					continue
				}

				await callback(file)
				break
			}
		}
	}

	mime() {
		return 'application/javascript'
	}

	type() {
		return 'js'
	}

	extension() {
		return 'js'
	}

}
