/* eslint-disable no-sync */

import Highlights from 'highlights'

const highlighter = new Highlights()
highlighter.requireGrammarsSync({
	modulePath: require.resolve('language-json5/package.json')
})

export function Highlighter(code, lang) {
	if(lang === 'json') {
		lang = 'json5'
	}

	return highlighter.highlightSync({
		fileContents: code,
		scopeName: `source.${lang}`
	})
}
