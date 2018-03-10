import '../BaseCommand'

import { AbortError, InputArgument, InputOption } from 'grind-cli'
import { FS } from 'grind-support'

const path = require('path')

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

	async run() {
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

		const migrationsDirectory = this.app.paths.project('database/migrations')
		await FS.mkdirs(migrationsDirectory).catch(() => { })

		const prefix = (new Date).toISOString().split(/\./)[0].replace(/[^0-9]/g, '')
		const filePath = path.join(migrationsDirectory, `${prefix}-${name}.js`)

		await this.app.stubs.generate(`grind-db::${stub}`, filePath, {
			table: tableName || 'table_name'
		})

		return this.success(`Created ${path.relative(this.app.paths.project(), filePath)}`)
	}

}
