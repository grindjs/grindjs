import './PostProcessor'

import '../Support/Require'

const UglifyJS = Require.optionally('uglify-js')

export class JavascriptMinifyPostProcessor extends PostProcessor {
	supportedExtensions = [ 'js' ]
	options = { }

	constructor(app, shouldOptimize) {
		super(app, shouldOptimize)

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
			Log.error('uglify-js missing, unable to minify. please run `npm install --save-dev uglify-js`')
			return Promise.resolve(contents)
		}

		return new Promise((resolve, reject) => {
			let result = null

			try {
				result = UglifyJS.minify(contents.toString(), Object.assign({ }, this.options, {
					fromString: true
				}))
			} catch(err) {
				err.file = sourcePath
				err.column = err.col
				return reject(err)
			}

			resolve(result.code)
		})
	}

}
