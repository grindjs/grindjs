import './PostProcessor'

import { FS } from 'grind-support'
import { MissingPackageError } from 'grind-framework'

const optional = require('optional')
const UglifyJS = optional('uglify-js')

const INLINE_SOURCE_MAP_REGEX = /\/\/[@#]\s+sourceMappingURL=data:application\/json(?:;charset[:=][^;]+)?;base64,(.*)\n/

export class JavascriptMinifyPostProcessor extends PostProcessor {
	supportedExtensions = [ 'js' ]
	options = { }

	constructor(app, shouldOptimize, sourceMaps) {
		super(app, shouldOptimize, sourceMaps)

		this.options = app.config.get('assets.post_processors.js.minify', { })

		if(typeof this.options.enabled === 'boolean') {
			this.shouldOptimize = this.options.enabled
		}
	}

	process(sourcePath, targetPath, contents) {
		if(!this.shouldOptimize || sourcePath.indexOf('.min.') >= 0) {
			return Promise.resolve(contents)
		}

		if(UglifyJS.isNil) {
			Log.error((new MissingPackageError('uglify-js', 'dev')).message, 'Unable to minify.')
			return Promise.resolve(contents)
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
			let result = null
			const targetPathMap = `${targetPath}.map`

			try {
				const options = Object.assign({ }, this.options, {
					fromString: true,
					inSourceMap: sourceMap,
				})

				if(useSourceMap) {
					if(inlineSourceMap) {
						options.sourceMapInline = true
					} else {
						options.outSourceMap = true
					}
				}

				result = UglifyJS.minify(contents.toString(), options)
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
