import { Cli } from './Cli'

declare module '@grindjs/framework' {
	interface Application {
		cli?: Cli
	}
}
