import './Grind'

export function postProcess(postProcessor, file, contents, hook = () => { }, ...args) {
	if(typeof hook !== 'function') {
		args.unshift(hook)
		hook = () => { }
	}

	const app = new Grind
	app.config.loadDefault('assets', app.paths.base('../../config/assets.json'))
	hook(app)

	return (new postProcessor(app, true, true)).process(app.paths.base('resources/assets', file), '', contents, ...args)
}
