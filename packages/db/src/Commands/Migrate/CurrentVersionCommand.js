import '../BaseCommand'

export class CurrentVersionCommand extends BaseCommand {

	name = 'migrate:current-version'
	description = 'View the current version for the migration'

	run() {
		return this.db.migrate.currentVersion().then(version => {
			this.comment(`Current Version: ${version}`)
		})
	}

}
