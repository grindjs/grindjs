import './JavascriptCompiler'

import '../Support/Require'
import '../Support/FS'

import path from 'path'

const Browserify = Require.optionally('browserify')
const Babelify = Require.optionally('babelify')

export class BabelCompiler extends JavascriptCompiler {
	wantsHashSuffixOnPublish = true
	supportedExtensions = [ 'js', 'jsx', 'es', 'es6', 'es7', 'esx' ]
	browserifyOptions = [ ]

	constructor(app, autoMinify) {
		super(app, autoMinify)

		this.browserifyOptions = app.config.get('assets.compilers.babel.browserify', { })

		if(this.browserifyOptions.debug.isNil) {
			this.browserifyOptions.debug = !autoMinify
		}
	}

	supports(pathname) {
		if(!super.supports(pathname)) {
			return false
		}

		return pathname.indexOf('babel') >= 0
	}

	compile(pathname) {
		if(Browserify.isNil) {
			return Promise.reject(new Error('browserify missing, please run `npm install --save-dev browserify`'))
		}

		if(Babelify.isNil) {
			return Promise.reject(new Error('babelify missing, please run `npm install --save-dev babelify`'))
		}

		return new Promise((resolve, reject) => {
			const browserify = Browserify(Object.assign({ }, this.browserifyOptions, {
				basedir: path.dirname(pathname)
			}))
			browserify.transform('babelify')
			browserify.add(pathname)
			browserify.bundle((err, contents) => {
				if(!err.isNil) {
					return reject(err)
				}

				resolve(contents)
			})
		}).then(contents => {
			if(!this.autoMinify) {
				return contents
			}

			return this.minify(contents.toString(), false)
		})

	}

	async enumerateImports(pathname, callback) {
		const exists = await FS.exists(pathname)

		if(!exists) {
			return
		}

		const contents = await FS.readFile(pathname)
		const importPaths = [ ]

		contents.toString().replace(/import\s*\{[^\}]+\}\s*from\s*((["'`]).+?(\2))/igm, (_, importPath) => {
			importPaths.push(importPath)
		})

		contents.toString().replace(/import\s*((["'`]).+?(\2))/ig, (_, importPath) => {
			importPaths.push(importPath)
		})

		contents.toString().replace(/require\s*\(([^\)]+)\)/ig, (_, importPath) => {
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

}
