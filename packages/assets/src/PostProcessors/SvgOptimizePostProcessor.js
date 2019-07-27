import './PostProcessor'

import '../Errors/makeSyntaxError'
import '../Support/optional'

const SVGO = optional('svgo', '>=1.1.0')

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

		if(!SVGO.resolve()) {
			return Promise.resolve(contents)
		}

		return (new SVGO.pkg(this.options)).optimize(contents).then(result => {
			if(result.isNil) {
				const error = new Error('Unknown error optimizing SVG')
				error.file = sourcePath
				throw error
			}

			if(!result.error.isNil) {
				throw new Error(result.error)
			}

			return result.data
		}).catch(error => {
			if(typeof error === 'string') {
				error = new Error(error)
			}

			if(typeof error.file !== 'string') {
				error.file = sourcePath
			}

			error.message = error.message.replace(/^Line:\s*([0-9]+)\s*$/m, (_, line) => {
				error.line = Number(line)

				if(contents.toString().trim().startsWith('<?')) {
					error.line++
				}

				return ''
			}).replace(/^Column:\s*([0-9]+)\s*$/m, (_, column) => {
				error.column = Number(column)
				return ''
			}).replace(/^Char:\s*.+?$/m, '').trim()

			return makeSyntaxError(this.app, {
				causedBy: error
			}).catch(() => { throw error }).then(error => { throw error })
		})
	}

}
