import './Compiler'

import '../Support/FS'
import '../Support/Require'

const UglifyJS = Require.optionally('uglify-js')

export class JavascriptCompiler extends Compiler {
	supportedExtensions = [ 'js' ]
	options = { }

	constructor(app, autoMinify) {
		super(app, autoMinify)

		this.options = app.config.get('assets.compilers.js', { })
	}

	compile(pathname) {
		if(!this.autoMinify || pathname.indexOf('.min.') >= 0) {
			return FS.readFile(pathname)
		}

		if(UglifyJS.isNil) {
			Log.error('uglify-js missing, unable to minify. please run `npm install uglify-js --save`')
			return FS.readFile(pathname)
		}

		return new Promise((resolve, reject) => {
			let result = null

			try {
				result = UglifyJS.minify(pathname, this.options)
			} catch(err) {
				err.file = err.filename
				err.column = err.col
				return reject(err)
			}

			resolve(result.code)
		})
	}

	mime() {
		return 'application/javascript'
	}

	type() {
		return 'js'
	}

	extension() {
		return 'js'
	}

}
