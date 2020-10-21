import { Application } from './Application'
import { Provider } from './Provider'

export class Kernel {
	as: string | null | undefined = null

	constructor(public app: Application, public options: Record<string, any> = {}) {}

	start(...args: any[]) {
		throw new Error('Subclasses must implement.')
	}

	shutdown() {
		throw new Error('Subclasses must implement.')
	}

	get providers(): Provider[] {
		return []
	}
}
