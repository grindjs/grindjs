import path from 'path'

import {
	default as BaseGrind,
	Paths as BasePaths
} from 'grind-framework'

class Paths extends BasePaths {

	constructor(bootstrapper) {
		super(bootstrapper)

		this._base = path.join(__dirname, '../fixtures')
		this._config = path.join(this._base, 'config')
	}

}

export class Grind extends BaseGrind {

	constructor(parameters = { }) {
		parameters.pathsClass = Paths
		super(parameters)
	}

}
