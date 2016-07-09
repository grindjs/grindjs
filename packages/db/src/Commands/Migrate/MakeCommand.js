import '../BaseCommand'

import path from 'path'

export class MakeCommand extends BaseCommand {
	name = 'make:migration'
	description = 'Create a migration file'
	arguments = [ 'name?' ]
	options = {
		create: 'Name of the table to create',
		alter: 'Name of the table to alter'
	}

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
			this.error('A migration name must be provided if `--create` or `--alter` aren’t used.')
			process.exit(1)
		}

		return this.db.migrate.make(name, {
			variables: { tableName },
			stub: path.join(__dirname, 'stubs', `${stub}.stub`)
		}).then(name => {
			this.success(`Created Migration: ${path.relative(process.cwd(), name)}`)
		})
	}

}
