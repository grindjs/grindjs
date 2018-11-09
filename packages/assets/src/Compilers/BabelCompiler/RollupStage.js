import './Stage'
import '../../Support/optional'

const rollup = optional('rollup', '>=0.66.0')
const rollupBabel = optional('rollup-plugin-babel', '>=4.0.0')

export class RollupStage extends Stage {

	static configName = 'rollup'
	plugins = [ ]
	options = null
	output = null

	constructor(app, sourceMaps, { enabled = false, output = { }, plugins = { }, ...options } = { }) {
		super(app, sourceMaps)

		this.options = options
		this.output = output
		this.enabled = enabled

		if(plugins['rollup-plugin-babel'].isNil) {
			plugins['rollup-plugin-babel'] = true
		}

		for(const [ plugin, config ] of Object.entries(plugins)) {
			if(config === false) {
				continue
			}

			if(plugin === 'rollup-plugin-babel') {
				this.plugins.push([ rollupBabel, config ])
			} else {
				this.plugins.push([ optional(plugin), config ])
			}
		}
	}

	async compile(pathname, stream = null) {
		rollup.assert()

		if(this.handleBabel) {
			rollupBabel.assert()
		}

		if(!stream.isNil) {
			throw new Error('Preprocessed stream not supported')
		}

		const plugins = [ ]

		for(const [ plugin, config ] of this.plugins) {
			if(plugin.name === 'rollup-plugin-babel' && !this.handleBabel) {
				continue
			}

			plugin.assert()

			if(!config.isNil && typeof config === 'object') {
				plugins.push(plugin.pkg(config))
			} else {
				plugins.push(plugin.pkg({ }))
			}
		}

		try {
			const bundle = await rollup.pkg.rollup({
				...this.options,
				input: pathname,
				plugins
			})

			const { code, map } = await bundle.generate({
				format: 'cjs',
				sourcemap: this.sourceMaps === 'auto',
				...this.output
			})

			const inlineMap = !map.isNil ? `\n//# sourceMappingURL=${map.toUrl()}\n` : null
			return `${code}${inlineMap || ''}`
		} catch(err) {
			const loc = err.loc || { }
			err.file = loc.file || pathname
			err.line = loc.line
			err.column = loc.column
			throw err
		}
	}

}
