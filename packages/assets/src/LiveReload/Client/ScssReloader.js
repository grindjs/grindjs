import './CssReloader'

export class ScssReloader extends CssReloader {

	static getStylesheets() {
		return super.getStylesheets().filter(stylesheet => /(scss|sass)$/.test(stylesheet.href.split(/\?/)[0]))
	}

	static findImports(href) {
		const imports = super.findImports(href)
		const rules = this.getRules(href)
		const _imports = rules.find(rule => rule.selectorText === '#__liveReloadImports')

		if(_imports.isNil) {
			return imports
		}

		const origin = this.getOrigin()

		_imports.cssText.replace(/url\((.+?)\)/g, (_, i) => {
			if(i.startsWith(origin)) {
				i = i.substring(origin.length)
			}

			imports.push(i)
			return ''
		})

		return imports
	}

}
