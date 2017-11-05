import babel from 'rollup-plugin-babel'
const path = require('path')

export default {
	input: path.join(__dirname, 'LiveReload.js'),
	output: {
		file: path.join(__dirname, '../../../dist/livereload.js'),
		format: 'cjs'
	},
	plugins: [ babel() ]
}
