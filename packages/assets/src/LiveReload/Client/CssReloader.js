const { getOrigin, cacheBust } = require('./Reloader')

module.exports = {

	reload: function(pathname) {
		const origin = getOrigin()
		const stylesheets = this.getStylesheets()
		const reload = [ ]

		for(let i = 0, length = stylesheets.length; i < length; i++) {
			const stylesheet = stylesheets[i]
			let href = stylesheet.href.split(/\?/)[0]

			if(href.substring(0, origin.length) === origin) {
				href = href.substring(origin.length)
			}

			if(href !== pathname && this.findImports(stylesheet).indexOf(pathname) === -1) {
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
	},

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
