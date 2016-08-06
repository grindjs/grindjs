import './Compiler'

import '../Support/FS'
import '../Support/Require'

const SVGO = Require.optionally('svgo')

export class SvgCompiler extends Compiler {
	wantsHashSuffixOnPublish = false
	supportedExtensions = [ 'svg' ]
	options = { }
	priority = 100

	constructor(app, autoMinify) {
		super(app, autoMinify)

		this.options = app.config.get('assets.compilers.svg', { })
	}

	compile(pathname) {
		return FS.readFile(pathname).then(svg => {
			if(!this.autoMinify || pathname.indexOf('.min.') >= 0) {
				return svg
			}

			if(SVGO.isNil) {
				Log.error('svgo missing, unable to minify. please run `npm install svgo --save`')
				return svg
			}

			return new Promise(async (resolve, reject) => {
				try {
					(new SVGO(this.options)).optimize(svg, (result) => {
						if(result.isNil) {
							return reject({
								file: pathname,
								message: 'Unknown error'
							})
						}

						if(!result.error.isNil) {
							const err = { file: pathname }
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
		})
	}

	mime() {
		return 'image/svg+xml'
	}

	type() {
		return 'img'
	}

	extension() {
		return 'svg'
	}

}
