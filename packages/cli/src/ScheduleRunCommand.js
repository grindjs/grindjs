import './Command'

export class ScheduleRunCommand extends Command {

	name = 'schedule:run'
	description = 'Starts the schedule daemon and executes commands as scheduled.'

	run() {
		this.info('Schedule daemon starting...')

		//const scheduled = this.cli.commands.map(command => command.registerSchedule())
		const scheduled = []
		for(const command of this.cli.commands) {
			if(typeof command.schedule === 'function') {
				scheduled.push(command.registerSchedule())
			}
		}

		return new Promise(() => {})
	}

}
