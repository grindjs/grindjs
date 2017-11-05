import './Stage'
import { MissingPackageError } from 'grind-framework'

const optional = require('optional')

const rollup = optional('rollup')
const rollupBabel = optional('rollup-plugin-babel')

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
		if(rollup.isNil) {
			throw new MissingPackageError('rollup', 'dev')
		} else if(this.handleBabel && rollupBabel.isNil) {
			throw new MissingPackageError('rollup-plugin-babel', 'dev')
		}

		if(!stream.isNil) {
			throw new Error('Preprocessed stream not supported')
		}

		const bundle = await rollup.rollup({
			...this.options,
			input: pathname,
			plugins: this.handleBabel ? [ rollupBabel(this.babel) ] : [ ]
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
