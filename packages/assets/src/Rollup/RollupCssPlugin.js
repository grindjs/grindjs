import './RollupPlugin'

export class RollupCssPlugin extends RollupPlugin {

	extensions = new Set([ 'css' ])

	transformPath(file) {
		return `
const link = document.createElement('link')
link.href = ${JSON.stringify(file)}
link.setAttribute('rel', 'stylesheet')
link.setAttribute('type', 'text/css')
link.setAttribute('media', 'all')
const head = document.head || document.getElementsByTagName('head')[0]
head.appendChild(link)
`.trim()
	}

}
