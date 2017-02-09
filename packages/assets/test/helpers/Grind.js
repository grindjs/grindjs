import 'babel-polyfill'
import path from 'path'

import {
	Grind as BaseGrind,
	Paths as BasePaths
} from 'grind-framework'

class Paths extends BasePaths {

	constructor() {
		super(null, path.join(__dirname, '../fixtures'))
	}

}

export class Grind extends BaseGrind {

	constructor(parameters = { }) {
		parameters.pathsClass = parameters.pathsClass || Paths
		super(parameters)
	}

}
