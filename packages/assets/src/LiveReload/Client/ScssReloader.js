const CssReloader = require('./CssReloader')
const { getOrigin } = require('./Reloader')

module.exports = {
	...CssReloader,

	getStylesheets: function() {
		return CssReloader.getStylesheets().filter(stylesheet => /(scss|sass)$/.test(stylesheet.href.split(/\?/)[0]))
	},

	findImports: function(href) {
		const imports = CssReloader.findImports(href)
		const rules = this.getRules(href)
		let importsRule = null

		for(let i = 0, length = rules.length; i < length; i++) {
			const rule = rules[i]

			if(rule.selectorText !== '#__liveReloadImports') {
				continue
			}

			importsRule = rule
			break
		}

		if(importsRule.isNil) {
			return imports
		}

		const origin = getOrigin()

		importsRule.cssText.replace(/url\((.+?)\)/g, (_, i) => {
			if(i.substring(0, origin.length) === origin) {
				i = i.substring(origin.length)
			}

			imports.push(i)
			return ''
		})

		return imports
	}

}
