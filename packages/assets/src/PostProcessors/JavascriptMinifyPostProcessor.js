import './PostProcessor'

import { FS, merge } from 'grind-support'
import { MissingPackageError } from 'grind-framework'

const optional = require('optional')
const INLINE_SOURCE_MAP_REGEX = /\/\/[@#]\s+sourceMappingURL=data:application\/json(?:;charset[:=][^;]+)?;base64,(.*)\n/

export class JavascriptMinifyPostProcessor extends PostProcessor {

	supportedExtensions = [ 'js' ]
	options = { }
	uglify
	uglifyPackage
	hasCheckedUglifyVersion = false

	constructor(app, shouldOptimize, sourceMaps) {
		super(app, shouldOptimize, sourceMaps)

		this.options = { ...app.config.get('assets.post_processors.js.minify', { }) }
		this.uglifyPackage = this.options.package || 'uglify-js'
		delete this.options.package

		this.uglify = optional(this.uglifyPackage)

		if(typeof this.options.enabled === 'boolean') {
			this.shouldOptimize = this.options.enabled
		}
	}

	process(sourcePath, targetPath, contents) {
		if(!this.shouldOptimize || sourcePath.indexOf('.min.') >= 0) {
			return Promise.resolve(contents)
		}

		if(this.uglify.isNil) {
			Log.error((new MissingPackageError(this.uglifyPackage, 'dev')).message, 'Unable to minify.')
			return Promise.resolve(contents)
		}

		if(!this.hasCheckedUglifyVersion) {
			const [ version ] = require(`${this.uglifyPackage}/package.json`).version.split(/\./)

			if(version < 3) {
				Log.error((new MissingPackageError(`${this.uglifyPackage}@>=3`, 'dev')).message, `Unable to minify, the version of ${this.uglifyPackage} installed is too old.`)
				return Promise.resolve(contents)
			}

			this.hasCheckedUglifyVersion = true
		}

		const useSourceMap = this.sourceMaps === 'auto'
		const inlineSourceMap = useSourceMap && targetPath.isNil
		let sourceMap = null

		if(useSourceMap) {
			contents = contents.toString().replace(INLINE_SOURCE_MAP_REGEX, (_, map) => {
				sourceMap = JSON.parse((new Buffer(map, 'base64')).toString())
				return ''
			})
		}

		return new Promise((resolve, reject) => {
			const targetPathMap = `${targetPath}.map`
			let result = null

			try {
				const options = merge(this.options, {
					sourceMap: {
						content: sourceMap
					}
				})

				if(useSourceMap && inlineSourceMap) {
					options.sourceMap.url = 'inline'
				}

				result = this.uglify.minify(contents.toString(), options)

				if(!result.error.isNil) {
					throw result.error
				}
			} catch(err) {
				err.file = sourcePath
				err.column = err.col
				return reject(err)
			}

			if(result.map.isNil || inlineSourceMap || !useSourceMap) {
				return resolve(result.code)
			}

			resolve(FS.writeFile(targetPathMap, result.map).then(() => result.code))
		})
	}

}
