import './PostProcessor'
import '../Support/optional'

const PostCSS = optional('postcss', '>=7.0.0')

export class CssPostCssPostProcessor extends PostProcessor {

	priority = 100
	supportedExtensions = [ 'css' ]
	plugins = [ ]
	options = { }

	constructor(app, shouldOptimize, sourceMaps) {
		super(app, shouldOptimize, sourceMaps)

		const plugins = app.config.get('assets.post_processors.css.postcss', { })

		for(const [ plugin, config ] of Object.entries(plugins)) {
			if(config === false) {
				continue
			}

			this.plugins.push([ optional(plugin), config ])
		}
	}

	process(sourcePath, targetPath, contents) {
		if(this.plugins.length === 0 || !PostCSS.resolve()) {
			return Promise.resolve(contents)
		}

		const plugins = [ ]

		for(const [ plugin, config ] of this.plugins) {
			if(!plugin.resolve()) {
				continue
			}

			if(!config.isNil && typeof config === 'object') {
				plugins.push(plugin.pkg(config))
			} else {
				plugins.push(plugin.pkg)
			}
		}

		return PostCSS.pkg(plugins).process(contents, {
			from: sourcePath,
			to: targetPath,
			map: this.sourceMaps === false ? false : {
				inline: true
			}
		}).then(result => result.css).catch(err => {
			err.file = sourcePath
			throw err
		})
	}

}
