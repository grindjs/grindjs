import { Application } from './Application'
import { Provider } from './Provider'

export class ProviderCollection {
	nextPriority = 0
	storage: Provider[] = []

	constructor(public app: Application) {}

	add(...providers: Provider[]) {
		const push: Provider[] = []

		for (const provider of providers) {
			if (provider.priority === Infinity) {
				this.app.loadKernelProvider(provider)
				continue
			} else if (typeof provider.priority !== 'number') {
				provider.priority = this.nextPriority--
			}

			push.push(provider)
		}

		this.storage.push(...push)
	}

	sort(func = (a: Provider, b: Provider) => ((a.priority ?? 0) > (b.priority ?? 0) ? 1 : -1)) {
		this.storage.sort(func)
	}

	[Symbol.iterator]() {
		const iterator = this.storage[Symbol.iterator]()

		return {
			next: () => iterator.next(),
		}
	}
}
