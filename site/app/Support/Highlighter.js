/* eslint-disable no-sync */

import Highlights from 'highlights'

const highlighter = new Highlights()

highlighter.requireGrammarsSync({
	modulePath: require.resolve('language-json5/package.json')
})

highlighter.requireGrammarsSync({
	modulePath: require.resolve('atom-jinja2/package.json')
})

export function Highlighter(code, lang) {
	switch(lang) {
		case 'json':
			lang = 'json5'
			break
		case 'nunjucks':
		case 'njk':
		case 'view':
			lang = 'jinja'
			break
	}

	return highlighter.highlightSync({
		fileContents: code,
		scopeName: `source.${lang}`
	})
}
