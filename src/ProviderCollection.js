export class ProviderCollection extends Array {
	nextPriority = 0

	push(...providers) {
		for(const provider of providers) {
			if(!provider.priority.isNil) {
				continue
			}

			provider.priority = this.nextPriority--
		}

		super.push(...providers)
	}

	sort(func) {
		if(func.isNil) {
			func = (a, b) => a.priority > b.priority ? 1 : -1
		}

		return super.sort(func)
	}

}
