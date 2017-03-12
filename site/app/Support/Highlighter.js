/* eslint-disable no-sync */

import Highlights from 'highlights'

const highlighter = new Highlights()

highlighter.requireGrammarsSync({
	modulePath: require.resolve('language-json5/package.json')
})

highlighter.requireGrammarsSync({
	modulePath: require.resolve('atom-jinja2/package.json')
})

highlighter.requireGrammarsSync({
	modulePath: require.resolve('language-blade/package.json')
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
			lang = 'text.html.php.blade'
			break
		default:
			lang = `source.${lang}`
	}

	return highlighter.highlightSync({
		fileContents: code,
		scopeName: lang
	})
}
