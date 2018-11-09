import { origininize, cacheBust } from './Reloader'

function reload(pathname) {
	const stylesheets = this.getStylesheets()
	const reload = [ ]

	for(let i = 0, length = stylesheets.length; i < length; i++) {
		const stylesheet = stylesheets[i]
		const href = origininize(stylesheet.href)

		if(href.indexOf(pathname) === -1 && this.findImports(stylesheet).indexOf(pathname) === -1) {
			continue
		}

		reload.push(stylesheet)
	}

	for(let j = 0, length2 = reload.length; j < length2; j++) {
		const link = reload[j]
		const replacement = document.createElement('link')

		for(let k = 0, length3 = link.attributes.length; k < length3; k++) {
			const attribute = link.attributes[k]
			replacement.setAttribute(attribute.name, attribute.value)
		}

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

export const helpers = {

	findImports: function(/* href */) {
		return [ ]
	},

	getStylesheets: function() {
		const results = [ ]
		const links = document.getElementsByTagName('link')

		for(let i = 0, length = links.length; i < length; i++) {
			const link = links[i]

			if(!link.hasAttribute('rel') || !/^stylesheet$/i.test(link.getAttribute('rel'))) {
				continue
			}

			results.push(link)
		}

		return results
	},

	getRules: function(stylesheet) {
		const href = stylesheet.href || stylesheet

		for(let i = 0, length = document.styleSheets.length; i < length; i++) {
			const sheet = document.styleSheets[i]

			if(sheet.href !== href) {
				continue
			}

			return sheet.cssRules || sheet.rules || [ ]
		}

		return [ ]
	}

}

export const CssReloader = reload.bind(helpers)
