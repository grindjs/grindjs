import { Command, StubCompiler } from 'grind-cli'
import './inflect'
import path from 'path'

export class MakeModelCommand extends Command {
	name = 'make:model'
	description = 'Create a model class'
	arguments = [ 'className?' ]
	options = {
		table: 'Name of the table to create the model for'
	}

	run() {
		let className = this.argument('className')
		let tableName = null
		let descriptiveName = null

		if(this.containsOption('table')) {
			tableName = this.option('table')

			if(className.isNil) {
				className = `${inflect.classify(tableName)}Model`
			}
		}

		if(tableName.isNil || tableName.length === 0) {
			tableName = 'table_name'
			descriptiveName = 'model'
		} else {
			descriptiveName = inflect.singularize(tableName)
		}

		if(className.isNil) {
			this.error('A class name must be provided if `--table` isn’t used.')
			process.exit(1)
		}

		const filePath = this.app.paths.app('Models', `${className}.js`)
		return StubCompiler(path.join(__dirname, 'stubs', 'Model.stub'), filePath, {
			className,
			tableName,
			descriptiveName
		}).then(() => {
			this.success(`Created ${path.relative(process.cwd(), filePath)}`)
		})
	}

}
