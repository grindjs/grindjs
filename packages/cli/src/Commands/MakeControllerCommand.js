import '../Command'
import '../Input/InputArgument'
import '../Input/InputOption'
import '../StubCompiler'

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

	run() {
		const name = this.argument('name')
		const stub = this.option('resource') ? 'Resource.stub' : 'Controller.stub'
		const filePath = this.app.paths.app('Controllers', `${name}.js`)

		return StubCompiler(path.join(__dirname, 'stubs', stub), filePath, {
			StubName: name
		}).then(() => {
			this.success(`Created ${path.relative(process.cwd(), filePath)}`)
		})
	}

}
