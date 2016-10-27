import './PostProcessor'

import '../Support/Require'

const PostCSS = Require.optionally('postcss')
const Autoprefixer = Require.optionally('autoprefixer')

export class CssAutoprefixerPostProcessor extends PostProcessor {
	priority = 100
	supportedExtensions = [ 'css' ]
	options = { }

	constructor(app, shouldOptimize) {
		super(app, shouldOptimize)

		this.options = app.config.get('assets.post_processors.css.autoprefix', { })
		this.shouldOptimize = this.options.enabled || true
	}

	process(sourcePath, targetPath, contents) {
		if(!this.shouldOptimize) {
			return Promise.resolve(contents)
		}

		if(Autoprefixer.isNil) {
			Log.error('autoprefixer missing, unable to minify. please run `npm install --save-dev autoprefixer`')
			return Promise.resolve(contents)
		}

		if(PostCSS.isNil) {
			Log.error('postcss missing, unable to minify. please run `npm install --save-dev postcss`')
			return Promise.resolve(contents)
		}

		return PostCSS([ Autoprefixer ]).process(contents).then(result => result.css).catch(err => {
			err.file = sourcePath
			throw err
		})
	}

}
