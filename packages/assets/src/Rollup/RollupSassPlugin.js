import './RollupCssPlugin'

export class RollupSassPlugin extends RollupCssPlugin {

	extensions = new Set([ 'sass', 'scss' ])

}
