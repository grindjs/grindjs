import { AbortError, Command, InputArgument, InputOption, StubCompiler } from 'grind-cli'
import './Inflect'

const path = require('path')

export class MakeModelCommand extends Command {

	name = 'make:model'
	description = 'Create a model class'

	arguments = [
		new InputArgument('name', InputArgument.VALUE_OPTIONAL, 'The name of the model.')
	]

	options = [
		new InputOption('table', InputOption.VALUE_OPTIONAL, 'Name of the table to create the model for')
	]

	run() {
		let name = this.argument('name')
		let tableName = null
		let descriptiveName = null

		if(this.containsOption('table')) {
			tableName = this.option('table')

			if(name.isNil) {
				name = `${Inflect.classify(tableName)}Model`
			}
		}

		if(tableName.isNil || tableName.length === 0) {
			tableName = 'table_name'
			descriptiveName = 'model'
		} else {
			descriptiveName = Inflect.singularize(tableName)
		}

		if(name.isNil) {
			throw new AbortError('A class name must be provided if `--table` isn’t used.')
		}

		const filePath = this.app.paths.app('Models', `${name}.js`)
		return StubCompiler(path.join(__dirname, 'stubs', 'Model.stub'), filePath, {
			StubName: name,
			StubTable: tableName,
			StubDescriptiveName: descriptiveName
		}).then(() => {
			this.success(`Created ${path.relative(process.cwd(), filePath)}`)
		})
	}

}
