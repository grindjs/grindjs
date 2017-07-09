import './Reloader'

export class CssReloader extends Reloader {

	static reload(pathname) {
		const origin = this.getOrigin()
		const stylesheets = this.getStylesheets()
		const reload = [ ]

		for(const stylesheet of stylesheets) {
			let href = stylesheet.href.split(/\?/)[0]

			if(href.startsWith(origin)) {
				href = href.substring(origin.length)
			}

			if(href !== pathname && this.findImports(stylesheet).indexOf(pathname) === -1) {
				continue

			}

			reload.push(stylesheet)
		}

		for(const link of reload) {
			const replacement = document.createElement('link')
			for(const { name, value } of Array.from(link.attributes)) {
				replacement.setAttribute(name, value)
			}

			replacement.href = this.cacheBust(replacement.href)

			replacement.addEventListener('load', () => {
				link.remove()
			}, false)

			replacement.addEventListener('error', () => {
				replacement.remove()
			}, false)

			link.parentNode.insertBefore(replacement, link)
		}
	}

	static findImports(/* href */) {
		return [ ]
	}

	static getStylesheets() {
		const results = [ ]

		for(const link of Array.from(document.getElementsByTagName('link'))) {
			if(!link.hasAttribute('rel') || !/^stylesheet$/i.test(link.getAttribute('rel'))) {
				continue
			}

			results.push(link)
		}

		return results
	}

	static getRules(stylesheet) {
		const href = stylesheet.href || stylesheet

		for(const sheet of Array.from(document.styleSheets)) {
			if(sheet.href !== href) {
				continue
			}

			return Array.from(sheet.cssRules || sheet.rules || [ ])
		}

		return [ ]
	}

}
