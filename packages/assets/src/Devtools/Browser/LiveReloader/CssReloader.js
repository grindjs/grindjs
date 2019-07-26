import '../Support/cacheBust'

export function CssReloader(pathname) {
	const reload = [ ]

	for(let i = 0, length = document.styleSheets.length; i < length; i++) {
		const sheet = document.styleSheets[i]

		if(findFiles(sheet).indexOf(pathname) === -1) {
			continue
		}

		reload.push(sheet)
	}

	for(let j = 0, length2 = reload.length; j < length2; j++) {
		const link = reload[j].ownerNode
		const replacement = link.cloneNode()
		replacement.href = cacheBust(replacement.href)

		replacement.addEventListener('load', () => {
			link.remove()
		}, false)

		replacement.addEventListener('error', () => {
			replacement.remove()
		}, false)

		link.parentNode.insertBefore(replacement, link)
	}
}

function findFiles(stylesheet) {
	const rules = stylesheet.cssRules || [ ]

	for(let i = rules.length - 1; i >= 0; i--) {
		const rule = rules[i]

		if(rule.selectorText !== '#__liveReloadModule') {
			continue
		}

		return JSON.parse(JSON.parse(rule.style.content))
	}

	return [ ]
}
