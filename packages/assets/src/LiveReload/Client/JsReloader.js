import { origininize } from './Reloader'

function reload(pathname) {
	const scripts = this.getScripts()

	for(let i = 0, length = scripts.length; i < length; i++) {
		const script = scripts[i]
		const src = origininize(script.src)

		if(src !== pathname && this.findImports(script).indexOf(pathname) === -1) {
			continue
		}

		window.location.reload()
		break
	}
}

export const helpers = {

	findImports: function(src) {
		return (window.__liveReloadImports || { })[origininize(src.src || src)] || [ ]
	},

	getScripts: function() {
		const results = [ ]
		const scripts = document.getElementsByTagName('script')

		for(let i = 0, length = scripts.length; i < length; i++) {
			const script = scripts[i]

			if(!script.hasAttribute('src')) {
				continue
			}

			results.push(script)
		}

		return results
	}

}

export const JsReloader = reload.bind(helpers)
