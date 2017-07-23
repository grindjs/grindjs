export class ProviderCollection {
	nextPriority = 0
	storage = [ ]

	add(...providers) {
		for(const provider of providers) {
			if(!provider.priority.isNil) {
				continue
			}

			provider.priority = this.nextPriority--
		}

		this.storage.push(...providers)
	}

	sort(func = (a, b) => a.priority > b.priority ? 1 : -1) {
		this.storage.sort(func)
	}

	[Symbol.iterator]() {
		const iterator = this.storage[Symbol.iterator]()

		return {
			next: () => iterator.next()
		}
	}

}
