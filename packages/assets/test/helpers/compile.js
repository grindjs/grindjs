import './Grind'

export function compile(compiler, file, hook = () => { }, ...args) {
	if(typeof hook !== 'function') {
		args.unshift(hook)
		hook = () => { }
	}

	const app = new Grind
	app.config.loadDefault('assets', app.paths.base('../../config/assets.json'))
	hook(app)

	return (new compiler(app)).compile(app.paths.base('resources/assets', file), ...args)
}
