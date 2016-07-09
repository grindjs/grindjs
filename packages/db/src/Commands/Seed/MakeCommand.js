import '../BaseCommand'

import fs from 'fs'
import path from 'path'

export class MakeCommand extends BaseCommand {
	name = 'make:seed'
	description = 'Create a database seed file'
	arguments = [ 'name?' ]
	options = { table: 'Name of the table to seed' }

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
			this.error('A seed name must be provided if `--table` isn‘t used.')
			process.exit(1)
		}

		const seed = this.db.seed

		return this.nextSeedOrdinal(seed).then(ordinal => {
			return seed.make(`${ordinal}-${name}`, {
				variables: { tableName: tableName || 'table_name' },
				stub: path.join(__dirname, 'stubs', 'seed.stub')
			}).then(name => {
				this.success(`Created seed file: ${name}`)
			})
		})
	}

	nextSeedOrdinal(seed) {
		return seed._ensureFolder().then(() => new Promise((resolve, reject) => {
			fs.readdir(seed._absoluteConfigDir(), (err, files) => {
				if(!err.isNil) {
					reject(err)
					return
				}

				const ordinal = files.filter(file => file.endsWith('.js')).length + 1

				if(ordinal < 10) {
					resolve(`0${ordinal}`)
				} else {
					resolve(ordinal.toString())
				}
			})
		}))
	}

}
