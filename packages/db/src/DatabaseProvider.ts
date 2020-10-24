import Application, { Provider } from '@grindjs/framework'

import { CurrentVersionCommand } from './Commands/Migrate/CurrentVersionCommand'
import { LatestCommand } from './Commands/Migrate/LatestCommand'
import { RollbackCommand } from './Commands/Migrate/RollbackCommand'
import { RunCommand } from './Commands/Seed/RunCommand'
import { ConfigBuilderType } from './ConfigBuilder'
import { DatabaseBuilder, DatabaseBuilderFunc } from './DatabaseBuilder'

export interface DatabaseProviderType extends Provider {
	(
		app: Application,
		databaseBuilder?: DatabaseBuilderFunc | null,
		configBuilder?: ConfigBuilderType | null,
	): void | Promise<void>
}

const DatabaseProvider: DatabaseProviderType = function (
	app: Application,
	databaseBuilder?: DatabaseBuilderFunc | null,
	configBuilder?: ConfigBuilderType | null,
) {
	databaseBuilder = databaseBuilder ?? DatabaseBuilder
	app.db = databaseBuilder(app.config.get('database.default'), app, configBuilder)
	app.cli?.register(CurrentVersionCommand, LatestCommand, RollbackCommand, RunCommand)
}

DatabaseProvider.shutdown = app => app.db?.destroy()
DatabaseProvider.priority = 70000

export { DatabaseProvider }
