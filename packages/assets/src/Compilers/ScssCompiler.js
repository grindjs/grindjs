import './Compiler'

import '../Support/FS'
import '../Support/Require'

import path from 'path'

const sass = Require.optionally('node-sass')

export class ScssCompiler extends Compiler {
	supportedExtensions = [ 'scss', 'sass' ]
	options = { }
	priority = 1000

	constructor(app, autoMinify) {
		super(app, autoMinify)

		this.options = app.config.get('assets.compilers.scss', { })

		if(
			this.options.sourceMap.isNil
			&& this.options.sourceMapEmbed.isNil
			&& this.options.sourceMapContents.isNil
		) {
			this.options.sourceMap = true
			this.options.sourceMapEmbed = true
			this.options.sourceMapContents = true
		}
	}

	compile(pathname, context) {
		if(sass.isNil) {
			return Promise.reject(new Error('node-sass missing, please run `npm install --save-dev node-sass`'))
		}

		return new Promise((resolve, reject) => {
			sass.render(Object.assign({ }, this.options, {
				file: pathname,
				outputStyle: context || 'nested'
			}), (err, result) => {
				if(!err.isNil) {
					return reject(err)
				}

				resolve(result.css)
			})
		})
	}

	async enumerateImports(pathname, callback) {
		const exists = await FS.exists(pathname)

		if(!exists) {
			return
		}

		const contents = await FS.readFile(pathname)
		const importPaths = [ ]

		contents.toString().replace(/@import\s?([^\s]+);/ig, (_, importPath) => {
			importPaths.push(importPath)
		})

		for(let importPath of importPaths) {
			const dirname = path.dirname(pathname)
			importPath = importPath.replace(/("|'|url|\(|\))/g, '').trim()
			let partial = null

			if(importPath.indexOf('/') >= 0) {
				partial = path.join(dirname, path.dirname(importPath), `_${path.basename(importPath)}`)
			} else {
				partial = path.join(dirname, `_${importPath}`)
			}

			importPath = path.join(dirname, importPath)
			const ext = path.extname(importPath)
			const files = [ ]

			if(ext !== '.scss' && ext !== '.sass') {
				files.push(`${importPath}.scss`)
				files.push(`${partial}.scss`)
				files.push(`${importPath}.sass`)
				files.push(`${partial}.sass`)
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
		return 'text/css'
	}

	type() {
		return 'css'
	}

	extension() {
		return 'css'
	}

}
