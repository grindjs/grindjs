import './Command'

export class ScheduleCommand extends Command {

	name = 'schedule:run'
	description = 'Starts the schedule daemon and executes commands as scheduled.'

	async run() {
		this.info('Schedule daemon starting...')

		const scheduled = []

		for(let command of this.cli.commands) {
			if(typeof(command.schedule) === 'function') {
				scheduled.push(command.registerSchedule())
			}
		}

		await Promise.all(scheduled)
	}

}