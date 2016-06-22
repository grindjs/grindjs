import {Cli} from './Cli'

export function Provider(app) {
	app.set('cli', new Cli(app))
}
