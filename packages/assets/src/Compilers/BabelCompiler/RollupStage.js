import './Stage'
import '../../Support/optional'

const rollup = optional('rollup', '>=1.0.0')
const rollupBabel = optional('rollup-plugin-babel', '>=4.3.0')

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
			} else if(plugin[0] === '~') {
				const name = `Rollup${plugin[1].toUpperCase()}${plugin.substring(2)}Plugin`
				this.plugins.push([ require(`../../Rollup/${name}`)[name], {
					grind: app,
					req: true,
					...(!config.isNil && typeof config === 'object' ? config : { })
				} ])
			} else {
				if(plugin === 'rollup-plugin-replace' && config['process.env.NODE_ENV'].isNil) {
					config['process.env.NODE_ENV'] = JSON.stringify(process.env.ROLLUP_ENV || process.env.BABEL_ENV || process.env.NODE_ENV)
				}

				this.plugins.push([ optional(plugin), config ])
			}
		}
	}

	async compile(pathname, stream = null, req = null) {
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
				if(config.req === true) {
					config.req = req
				}

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

			const { output } = await bundle.generate({
				format: 'cjs',
				sourcemap: this.sourceMaps === 'auto',
				...this.output
			})

			if(!Array.isArray(output) || output.length !== 1 || output[0].isEntry !== true) {
				throw new Error('Unsupported file')
			}

			const [ { map, code } ] = output

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
