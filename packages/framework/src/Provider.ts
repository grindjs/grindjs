import { Application } from './Application'

export interface Provider {
	(app: Application): void | Promise<void>

	shutdown?: (app: Application) => void | Promise<void>
	priority?: number | null
}
