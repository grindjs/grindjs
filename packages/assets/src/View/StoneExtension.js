export class StoneExtension {

	static extend(view) {
		view.extend('asset', args => this.asset(args))

		for(const directive of [ 'style', 'css', 'sass', 'scss', 'styl', 'stylus', 'less' ]) {
			view.extend(directive, args => this.append(`'${directive}', ${args}`))
		}

		for(const directive of [ 'script', 'js', 'babel', 'coffee' ]) {
			view.extend(directive, args => this.append(`'${directive}', ${args}`))
		}
	}

	static asset(rawArgs) {
		const args = rawArgs.trim().split(/,/, 2).map(value => value.trim())
		const type = args[0].toLowerCase()

		if(type === '\'render\'' || type === '"render"' || type === '`render`') {
			return this.render(args[1])
		}

		return this.append(rawArgs)
	}

	static append(args) {
		return `_assetContainer.append(${args});`
	}

	static render(type) {
		return `output += _assetContainer.render(${type});`
	}

}
