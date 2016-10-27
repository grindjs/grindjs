import './PostProcessor'

import '../Support/Require'

const CleanCSS = Require.optionally('clean-css')

export class CssMinifyPostProcessor extends PostProcessor {
	supportedExtensions = [ 'css' ]
	options = { }

	constructor(app, shouldOptimize) {
		super(app, shouldOptimize)

		this.options = app.config.get('assets.post_processors.css.minify', { })

		if(typeof this.options.enabled === 'boolean') {
			this.shouldOptimize = this.options.enabled
		}
	}

	process(sourcePath, targetPath, contents) {
		if(!this.shouldOptimize || sourcePath.indexOf('.min.') >= 0) {
			return Promise.resolve(contents)
		}

		if(CleanCSS.isNil) {
			Log.error('clean-css missing, unable to minify. please run `npm install --save-dev clean-css`')
			return Promise.resolve(contents)
		}

		return new Promise(async (resolve, reject) => {
			try {
				(new CleanCSS(this.options)).minify(contents, (err, result) => {
					if(!err.isNil) {
						return reject({
							file: sourcePath,
							message: err[0]
						})
					}

					resolve(result.styles)
				})
			} catch(err) {
				return reject(err)
			}
		})
	}

}
