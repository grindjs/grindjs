export class StoneLoop {

	target
	iterator
	_index

	constructor(target) {
		this.target = target
		this.iterator = target[Symbol.iterator]()
		this._index = 0
	}

	[Symbol.iterator]() {
		return {
			next: () => {
				this._index++
				return this.iterator.next()
			}
		}
	}

	get index() {
		return this._index - 1
	}

	get iteration() {
		return this._index
	}

	get length() {
		return this.target.length || this.target.size
	}

	get size() {
		return this.target.length || this.target.size
	}

	get count() {
		return this.target.length || this.target.size
	}

	get first() {
		return this._index === 1
	}

	get last() {
		return this._index === this.length
	}

	get remaining() {
		return this.length - this._index
	}

}
