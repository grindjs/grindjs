module.exports = {
	plugins: [
		[
			'module-resolver',
			{
				alias: {
					App: './app',
					Boot: './boot',
				},
			},
		],
	],
	presets: ['grind'],
}
