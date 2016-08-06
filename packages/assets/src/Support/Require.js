export class Require {

	static optionally(module) {
		try {
			return require(module)
		} catch(e) {
			// Do nothing
		}

		return null
	}

}
