import './PostProcessor'

import '../Support/Require'

const SVGO = Require.optionally('svgo')

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
			Log.error('svgo missing, unable to minify. please run `npm install --save-dev svgo`')
			return Promise.resolve(contents)
		}

		return new Promise((resolve, reject) => {
			try {
				(new SVGO(this.options)).optimize(contents, result => {
					if(result.isNil) {
						return reject({
							file: sourcePath,
							message: 'Unknown error'
						})
					}

					if(!result.error.isNil) {
						const err = { file: sourcePath }

						err.message = result.error.replace(/Line:\s*([0-9]+)\s*/, (_, line) => {
							err.line = line
							return ''
						}).replace(/Column:\s*([0-9]+)\s*/, (_, column) => {
							err.column = column
							return ''
						})

						Log.comment('error', result.error, typeof result.error)
						return reject(err)
					}

					resolve(result.data)
				})
			} catch(err) {
				return reject(err)
			}
		})
	}

}
