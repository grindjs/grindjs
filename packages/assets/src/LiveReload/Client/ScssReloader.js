const CssReloader = require('./CssReloader')
const { origininize } = require('./Reloader')

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

		importsRule.cssText.replace(/url\((.+?)\)/g, (_, i) => {
			imports.push(origininize(i))
			return ''
		})

		return imports
	}

}
