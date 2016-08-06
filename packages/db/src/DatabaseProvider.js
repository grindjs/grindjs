import './Database'

import './Commands/Migrate/CurrentVersionCommand'
import './Commands/Migrate/LatestCommand'
import './Commands/Migrate/RollbackCommand'
import './Commands/Migrate/MakeCommand'

import {RunCommand as SeedRunCommand} from './Commands/Seed/RunCommand'
import {MakeCommand as SeedMakeCommand} from './Commands/Seed/MakeCommand'

export function DatabaseProvider(app) {
	app.set('db', Database(app.config.get('database.default'), app))

	if(app.cli.isNil) {
		return
	}

	app.cli.register([
		CurrentVersionCommand,
		LatestCommand,
		RollbackCommand,
		MakeCommand,

		SeedRunCommand,
		SeedMakeCommand
	])
}

DatabaseProvider.priority = 50000
