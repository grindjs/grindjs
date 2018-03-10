import { Command, StubCompiler } from 'grind-cli'
import path from 'path'

export class BaseCommand extends Command {

	db = null

	ready() {
		return super.ready().then(() => {
			this.db = this.app.db
		})
	}

	generateStub(stub, target, context) {
		return StubCompiler(stub, target, context).then(() => {
			this.success(`Created ${path.relative(process.cwd(), target)}`)
		})
	}

}
