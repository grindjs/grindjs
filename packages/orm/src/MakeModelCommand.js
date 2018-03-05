import { AbortError, Command, InputArgument, InputOption } from 'grind-cli'
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

	async run() {
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

		const filePath = this.app.paths.project(`app/Models/${name}.js`)

		await this.app.stubs.generate('grind-orm::model', filePath, {
			name,
			tableName,
			descriptiveName
		})

		return this.success(`Created ${path.relative(this.app.paths.project(), filePath)}`)
	}

}
