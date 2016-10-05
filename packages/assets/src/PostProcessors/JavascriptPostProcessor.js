import './PostProcessor'

import '../Support/FS'
import '../Support/Require'

const UglifyJS = Require.optionally('uglify-js')

export class JavascriptPostProcessor extends PostProcessor {
	supportedExtensions = [ 'js' ]
	options = { }

	constructor(app, autoMinify) {
		super(app, autoMinify)

		this.options = app.config.get('assets.post_processors.js', { })
	}

	process(pathname) {
		if(!this.autoMinify || pathname.indexOf('.min.') >= 0) {
			return FS.readFile(pathname)
		}

		return this.minify(pathname)
	}

	minify(value, isPath = true) {
		if(UglifyJS.isNil) {
			Log.error('uglify-js missing, unable to minify. please run `npm install --save-dev uglify-js`')

			if(isPath) {
				return FS.readFile(value)
			}

			return Promise.resolve(value)
		}

		return new Promise((resolve, reject) => {
			let result = null

			try {
				result = UglifyJS.minify(value, Object.assign({ }, this.options, {
					fromString: !isPath
				}))
			} catch(err) {
				err.file = err.filename
				err.column = err.col
				return reject(err)
			}

			resolve(result.code)
		})
	}

	type() {
		return 'js'
	}

}
