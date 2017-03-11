import './Template'
import './Compiler'

export class StoneEngine {
	viewsPath = null
	compiler = null

	context = {
		escape: Template.escape
	}

	constructor(viewsPath) {
		this.viewsPath = viewsPath
		this.compiler = new Compiler(this)
	}

	render(template, context) {
		return (this.compiler.compile(this.resolve(template)))({
			...this.context,
			...context,
			$engine: this,
			$compiler: this.compiler
		})
	}

	resolve(template) {
		return `${this.viewsPath}/${template.replace(/\./g, '/')}.stone`
	}

}
