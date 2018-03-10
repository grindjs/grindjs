import './DatabaseBuilder'

import './Commands/Migrate/CurrentVersionCommand'
import './Commands/Migrate/LatestCommand'
import './Commands/Migrate/RollbackCommand'

import './Commands/Seed/RunCommand'

export function DatabaseProvider(app, databaseBuilder = null, configBuilder = null) {
	databaseBuilder = databaseBuilder || DatabaseBuilder
	app.db = databaseBuilder(app.config.get('database.default'), app, configBuilder)

	if(app.cli.isNil) {
		return
	}

	app.cli.register([
		CurrentVersionCommand,
		LatestCommand,
		RollbackCommand,

		RunCommand
	])
}

DatabaseProvider.shutdown = app => app.db.destroy()
DatabaseProvider.priority = 70000
