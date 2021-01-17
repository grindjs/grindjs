import { Cache } from 'cache-manager'

declare module '@grindjs/framework' {
	interface Application {
		cache?: Cache
	}
}
