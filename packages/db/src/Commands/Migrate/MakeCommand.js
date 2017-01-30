import '../BaseCommand'

import { AbortError, InputArgument, InputOption } from 'grind-cli'

import path from 'path'

function prefix() {
	return (new Date).toISOString().split(/\./)[0].replace(/[^0-9]/g, '')
}

export class MakeCommand extends BaseCommand {
	name = 'make:migration'
	description = 'Create a migration file'

	arguments = [
		new InputArgument('name', InputArgument.VALUE_OPTIONAL, 'The name of the migration file.')
	]

	options = [
		new InputOption('create', InputOption.VALUE_OPTIONAL, 'Name of the table to create'),
		new InputOption('alter', InputOption.VALUE_OPTIONAL, 'Name of the table to alter')
	]

	run() {
		let tableName = null
		let stub = 'generic'
		let name = this.argument('name')

		if(this.containsOption('create')) {
			tableName = this.option('create')
			stub = 'create-table'

			if(name.isNil) {
				name = `create_${tableName}_table`
			}
		} else if(this.containsOption('alter')) {
			tableName = this.option('alter')
			stub = 'alter-table'

			if(name.isNil) {
				name = `alter_${tableName}_table`
			}
		}

		if(name.isNil) {
			throw new AbortError('A migration name must be provided if `--create` or `--alter` aren’t used.')
		}

		return this.generateStub(
			path.join(__dirname, 'stubs', `${stub}.stub`),
			path.join(this.db.migrate._absoluteConfigDir(), `${prefix()}-${name}.js`), {
				StubTable: tableName || 'table_name'
			}
		)
	}

}
