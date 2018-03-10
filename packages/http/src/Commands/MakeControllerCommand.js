import { Command, InputArgument, InputOption } from 'grind-cli'

const path = require('path')

export class MakeControllerCommand extends Command {

	name = 'make:controller'
	description = 'Create a controller class'

	arguments = [
		new InputArgument('name', InputArgument.VALUE_REQUIRED, 'The name of the controller.')
	]

	options = [
		new InputOption(
			'resource',
			InputOption.VALUE_NONE,
			'Create a resource controller'
		)
	]

	async run() {
		const name = this.argument('name')
		const stub = this.option('resource') ? 'grind-http::resource' : 'grind-http::controller'
		const filePath = this.app.paths.project(`app/Controllers/${name}.js`)

		await this.app.stubs.generate(stub, filePath, { name })

		return this.success(`Created ${path.relative(this.app.paths.project(), filePath)}`)
	}

}
