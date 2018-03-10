import '../BaseCommand'

import { AbortError, InputArgument, InputOption } from 'grind-cli'
import { FS } from 'grind-support'
import path from 'path'

export class MakeCommand extends BaseCommand {

	name = 'make:seed'
	description = 'Create a database seed file'

	arguments = [
		new InputArgument('name', InputArgument.VALUE_OPTIONAL, 'The name of the seed')
	]

	options = [
		new InputOption('table', InputOption.VALUE_OPTIONAL, 'Name of the table to seed')
	]

	run() {
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

		const seed = this.db.seed

		return this.nextSeedOrdinal(seed).then(ordinal =>
			this.generateStub(
				path.join(__dirname, 'stubs', 'seed.stub'),
				path.join(seed._absoluteConfigDir(), `${ordinal}-${name}.js`), {
					StubTable: tableName || 'table_name'
				}
			)
		)
	}

	nextSeedOrdinal(seed) {
		return seed._ensureFolder().then(() => FS.readdir(seed._absoluteConfigDir())).then(files => {
			const ordinal = files.filter(file => file.endsWith('.js')).length + 1

			if(ordinal < 10) {
				return `0${ordinal}`
			}

			return ordinal.toString()
		})
	}

}
