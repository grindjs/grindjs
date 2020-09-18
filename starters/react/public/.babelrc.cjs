module.exports = {
	presets: [['@babel/preset-env', { modules: false }]],
	plugins: [
		'@babel/plugin-proposal-class-properties',
		'@babel/transform-react-jsx',
		'@shnhrrsn/babel-plugin-transform-isnil',
		'babel-plugin-import-auto-name',
		[
			'module-resolver',
			{
				alias: {
					App: './public/App',
					Public: './public',
				},
			},
		],
	],
}
