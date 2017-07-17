/* eslint-disable no-sync */

const Highlights = require('highlights')
const highlighter = new Highlights

highlighter.requireGrammarsSync({
	modulePath: require.resolve('language-json5/package.json')
})

highlighter.requireGrammarsSync({
	modulePath: require.resolve('atom-jinja2/package.json')
})

highlighter.requireGrammarsSync({
	modulePath: require.resolve('language-stone/package.json')
})

export function Highlighter(code, lang) {
	switch(lang) {
		case 'json':
			lang = 'source.json5'
			break
		case 'nunjucks':
		case 'njk':
			lang = 'source.jinja'
			break
		case 'stone':
		case 'view':
			lang = 'text.html.stone'
			break
		default:
			lang = `source.${lang}`
	}

	return highlighter.highlightSync({
		fileContents: code,
		scopeName: lang
	})
}
