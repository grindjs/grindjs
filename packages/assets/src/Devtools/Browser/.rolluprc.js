import babel from 'rollup-plugin-babel'
const path = require('path')

export default {
	input: path.join(__dirname, 'Devtools.js'),
	output: {
		file: path.join(__dirname, '../../../dist/devtools.js'),
		format: 'cjs'
	},
	plugins: [ babel() ]
}
