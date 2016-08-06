import './Compiler'

import '../Support/FS'
import '../Support/Require'

const CleanCSS = Require.optionally('clean-css')

export class CssCompiler extends Compiler {
	wantsHashSuffixOnPublish = false
	supportedExtensions = [ 'css' ]
	options = { }

	constructor(app, autoMinify) {
		super(app, autoMinify)

		this.options = app.config.get('assets.compilers.css', { })
	}

	compile(pathname) {
		return FS.readFile(pathname).then(css => {
			if(!this.autoMinify || pathname.indexOf('.min.') >= 0) {
				return css
			}

			if(CleanCSS.isNil) {
				Log.error('clean-css missing, unable to minify. please run `npm install --save-dev clean-css`')
				return css
			}

			return new Promise(async (resolve, reject) => {
				try {
					(new CleanCSS(this.options)).minify(css, (err, result) => {
						if(!err.isNil) {
							return reject({
								file: pathname,
								message: err[0]
							})
						}

						resolve(result.styles)
					})
				} catch(err) {
					return reject(err)
				}
			})
		})
	}

	mime() {
		return 'text/css'
	}

	type() {
		return 'css'
	}

	extension() {
		return 'css'
	}

}
