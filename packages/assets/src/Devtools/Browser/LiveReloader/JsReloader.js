const attributeName = 'data-live-reload-module'

export function JsReloader(pathname) {
	const scripts = getScripts()

	for(let i = 0, length = scripts.length; i < length; i++) {
		const script = scripts[i]
		const moduleName = script.getAttribute(attributeName)

		if(findFiles(moduleName).indexOf(pathname) === -1) {
			continue
		}

		window.location.reload()
		break
	}
}

function findFiles(name) {
	return (window.__liveReloadModules || { })[name] || [ ]
}

function getScripts() {
	const results = [ ]
	const scripts = document.getElementsByTagName('script')

	for(let i = 0, length = scripts.length; i < length; i++) {
		const script = scripts[i]

		if(!script.hasAttribute(attributeName)) {
			continue
		}

		results.push(script)
	}

	return results
}
