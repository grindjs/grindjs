import './PostProcessor'
import '../Support/optional'

const PostCSS = optional('postcss', '>=7.0.0')
const Autoprefixer = optional('autoprefixer', '>=9.3.0')

export class CssAutoprefixerPostProcessor extends PostProcessor {

	priority = 100
	supportedExtensions = [ 'css' ]
	options = { }

	constructor(app, shouldOptimize, sourceMaps) {
		super(app, shouldOptimize, sourceMaps)

		this.options = app.config.get('assets.post_processors.css.autoprefix', { })
		this.shouldOptimize = this.options.enabled || true

		if(this.options.sourceMap.isNil && this.sourceMaps === 'auto') {
			this.options.sourceMap = true
		}
	}

	process(sourcePath, targetPath, contents) {
		if(!this.shouldOptimize) {
			return Promise.resolve(contents)
		}

		if(!Autoprefixer.resolve()) {
			return Promise.resolve(contents)
		}

		if(!PostCSS.resolve()) {
			return Promise.resolve(contents)
		}

		return PostCSS.pkg([ Autoprefixer.pkg ]).process(contents).then(result => result.css).catch(err => {
			err.file = sourcePath
			throw err
		})
	}

}
