import './PostProcessor'
import '../Support/optional'

import { FS, merge } from 'grind-support'

const INLINE_SOURCE_MAP_REGEX = /\/\/[@#]\s+sourceMappingURL=data:application\/json(?:;charset[:=][^;]+)?;base64,(.*)\n/

export class JavascriptMinifyPostProcessor extends PostProcessor {

	supportedExtensions = [ 'js' ]
	options = { }
	uglify

	constructor(app, shouldOptimize, sourceMaps) {
		super(app, shouldOptimize, sourceMaps)

		this.options = { ...app.config.get('assets.post_processors.js.minify', { }) }
		this.uglify = optional(this.options.package || 'uglify-js', '>=3.0.0')
		delete this.options.package

		if(typeof this.options.enabled === 'boolean') {
			this.shouldOptimize = this.options.enabled
		}
	}

	process(sourcePath, targetPath, contents) {
		if(!this.shouldOptimize || sourcePath.indexOf('.min.') >= 0) {
			return Promise.resolve(contents)
		}

		if(!this.uglify.resolve()) {
			return Promise.resolve(contents)
		}

		const useSourceMap = this.sourceMaps === 'auto'
		const inlineSourceMap = useSourceMap && targetPath.isNil
		let sourceMap = null

		if(useSourceMap) {
			contents = contents.toString().replace(INLINE_SOURCE_MAP_REGEX, (_, map) => {
				sourceMap = JSON.parse((Buffer.from(map, 'base64')).toString())
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

				result = this.uglify.pkg.minify(contents.toString(), options)

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
