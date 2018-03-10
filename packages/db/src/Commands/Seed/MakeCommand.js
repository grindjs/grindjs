import { Command, AbortError, InputArgument, InputOption } from 'grind-cli'
import { FS } from 'grind-support'

const path = require('path')

export class MakeCommand extends Command {

	name = 'make:seed'
	description = 'Create a database seed file'
	seedDirectory = 'database/seeds'

	arguments = [
		new InputArgument('name', InputArgument.VALUE_OPTIONAL, 'The name of the seed')
	]

	options = [
		new InputOption('table', InputOption.VALUE_OPTIONAL, 'Name of the table to seed')
	]

	async run() {
		let tableName = null
		let name = this.argument('name')

		if(this.containsOption('table')) {
			tableName = this.option('table')

			if(name.isNil) {
				name = tableName
			}
		}

		if(name.isNil) {
			throw new AbortError('A seed name must be provided if `--table` isn‘t used.')
		}

		const ordinal = await this.nextSeedOrdinal()
		const filePath = this.app.paths.project(this.seedDirectory, `${ordinal}-${name}.js`)

		await this.app.stubs.generate('grind-db::seed', filePath, {
			table: tableName || 'table_name'
		})

		return this.success(`Created ${path.relative(this.app.paths.project(), filePath)}`)
	}

	async nextSeedOrdinal() {
		const directory = this.app.paths.project(this.seedDirectory)
		await FS.mkdirp(directory).catch(() => { })

		const files = await FS.readdir(directory)
		const ordinal = files.filter(file => file.endsWith('.js')).length + 1

		if(ordinal < 10) {
			return `0${ordinal}`
		}

		return ordinal.toString()
	}

}
