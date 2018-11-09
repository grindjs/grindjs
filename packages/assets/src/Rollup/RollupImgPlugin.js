import './RollupCssPlugin'

export class RollupImgPlugin extends RollupCssPlugin {

	extensions = new Set([ 'svg', 'jpg', 'jpeg', 'png', 'gif' ])

	transformPath(file) {
		return `export default ${JSON.stringify(file)}`
	}

}
