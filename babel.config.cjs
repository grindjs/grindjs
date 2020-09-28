module.exports = {
	presets: [
		'@babel/preset-typescript',
		[
			'grind',
			{
				'import-auto-name': {
					autoresolve: true,
				},
			},
		],
	],
	plugins: [
		'@babel/plugin-proposal-nullish-coalescing-operator',
		'@babel/plugin-proposal-numeric-separator',
		'@babel/plugin-proposal-optional-chaining',
		'@babel/plugin-syntax-dynamic-import',
		'babel-plugin-dynamic-import-node',
	],
}
