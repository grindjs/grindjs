import { helpers as cssHelpers, CssReloader } from './CssReloader'
import { origininize } from './Reloader'

export const helpers = {

	...cssHelpers,

	getStylesheets: function() {
		return cssHelpers.getStylesheets().filter(stylesheet => /(scss|sass)$/.test(stylesheet.href.split(/\?/)[0]))
	},

	findImports: function(href) {
		const imports = cssHelpers.findImports(href)
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

		if(!importsRule) {
			return imports
		}

		importsRule.cssText.replace(/url\((.+?)\)/g, (_, i) => {
			imports.push(origininize(i))
			return ''
		})

		return imports
	}

}

export const ScssReloader = CssReloader.bind(helpers)
