export class ProviderCollection {
	app = null
	nextPriority = 0
	storage = []

	constructor(app) {
		this.app = app
	}

	add(...providers) {
		const push = []

		for (const provider of providers) {
			if (provider.priority === Infinity) {
				this.app.loadKernelProvider(provider)
				continue
			} else if (provider.priority.isNil) {
				provider.priority = this.nextPriority--
			}

			push.push(provider)
		}

		this.storage.push(...push)
	}

	sort(func = (a, b) => (a.priority > b.priority ? 1 : -1)) {
		this.storage.sort(func)
	}

	[Symbol.iterator]() {
		const iterator = this.storage[Symbol.iterator]()

		return {
			next: () => iterator.next(),
		}
	}
}
