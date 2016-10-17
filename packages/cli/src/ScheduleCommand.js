import './Command'

export class ScheduleRunCommand extends Command {

	name = 'schedule:run'
	description = 'Starts the schedule daemon and executes commands as scheduled.'

	run() {
		this.info('Schedule daemon starting...')

		const scheduled = this.cli.commands.map(command => command.registerSchedule())

		return Promise.all(scheduled)
	}

}
