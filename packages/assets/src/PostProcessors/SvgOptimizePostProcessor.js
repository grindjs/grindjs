import './PostProcessor'

import { MissingPackageError } from 'grind-framework'

const optional = require('optional')
const SVGO = optional('svgo')

export class SvgOptimizePostProcessor extends PostProcessor {

	supportedExtensions = [ 'svg' ]
	options = { }

	constructor(app, shouldOptimize, sourceMaps) {
		super(app, shouldOptimize, sourceMaps)

		this.options = app.config.get('assets.post_processors.svg.optimize', { })

		if(typeof this.options.enabled === 'boolean') {
			this.shouldOptimize = this.options.enabled
		}
	}

	process(sourcePath, targetPath, contents) {
		if(!this.shouldOptimize || sourcePath.indexOf('.min.') >= 0) {
			return Promise.resolve(contents)
		}

		if(SVGO.isNil) {
			Log.error((new MissingPackageError('svgo', 'dev')).message, 'Unable to minify.')
			return Promise.resolve(contents)
		}

		return (new SVGO(this.options)).optimize(contents).then(result => {
			if(result.isNil) {
				const error = new Error('Unknown error optimizing SVG')
				error.file = sourcePath
				throw error
			}

			if(!result.error.isNil) {
				const error = new Error('Error optimizing SVG')
				error.file = sourcePath

				error.message = result.error.replace(/Line:\s*([0-9]+)\s*/, (_, line) => {
					error.line = line
					return ''
				}).replace(/Column:\s*([0-9]+)\s*/, (_, column) => {
					error.column = column
					return ''
				})

				throw error
			}

			return result.data
		})
	}

}
