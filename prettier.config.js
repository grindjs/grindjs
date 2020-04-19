module.exports = {
	arrowParens: 'avoid',
	bracketSpacing: true,
	printWidth: 100,
	quoteProps: 'consistent',
	semi: false,
	singleQuote: true,
	tabWidth: 2,
	trailingComma: 'all',
	useTabs: false,
	overrides: [
		{
			files: ['**/*.js', '**/*.cjs'],
			options: {
				tabWidth: 4,
				useTabs: true,
			},
		},
	],
}
