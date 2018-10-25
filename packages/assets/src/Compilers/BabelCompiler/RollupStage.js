import './Stage'
import '../../Support/optional'

const rollup = optional('rollup', '>=0.66.0')
const rollupBabel = optional('rollup-plugin-babel', '>=4.0.0')

export class RollupStage extends Stage {

	static configName = 'rollup'
	options = null
	babel = null
	output = null

	constructor(sourceMaps, { enabled = false, babel = { }, output = { }, ...options } = { }) {
		super(sourceMaps)

		this.options = options
		this.babel = babel
		this.output = output
		this.enabled = enabled
	}

	async compile(pathname, stream = null) {
		rollup.assert()

		if(this.handleBabel) {
			rollupBabel.assert()
		}

		if(!stream.isNil) {
			throw new Error('Preprocessed stream not supported')
		}

		const bundle = await rollup.pkg.rollup({
			...this.options,
			input: pathname,
			plugins: this.handleBabel ? [ rollupBabel.pkg(this.babel) ] : [ ]
		})

		const { code, map } = await bundle.generate({
			format: 'cjs',
			sourcemap: this.sourceMaps === 'auto',
			...this.output
		})

		const inlineMap = !map.isNil ? `\n//# sourceMappingURL=${map.toUrl()}\n` : null
		return `${code}${inlineMap || ''}`
	}

}
