import { Cli } from '../Cli'
import { Command } from '../Command'
import { ToolkitApplication } from './ToolkitApplication'

export class ToolkitCommand extends Command {
	app: ToolkitApplication

	constructor(app: ToolkitApplication, public cli: Cli) {
		super(app as any, cli)
		this.app = app
	}
}
