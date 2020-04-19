import babel from 'rollup-plugin-babel'
import cjs from 'rollup-plugin-commonjs'
import nodeResolve from 'rollup-plugin-node-resolve'
import replace from 'rollup-plugin-replace'

const path = require('path')

export default {
	input: path.join(__dirname, 'index.js'),
	output: {
		file: path.join(__dirname, '../../dist/react-dev.js'),
		format: 'cjs',
	},
	plugins: [
		babel(),
		nodeResolve(),
		cjs(),
		replace({
			'process.env.NODE_ENV': JSON.stringify('development'),
		}),
	],
}
