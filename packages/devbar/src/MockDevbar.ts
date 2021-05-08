import { IDevbar } from './IDevbar'
/**
 * Mock Devbar class that provides the same interface as Devbar
 * but doesn’t actually do anything.
 *
 * This is used when app.debug is off, allowing instrumented code
 * to run unaffected in production.
 */
export const MockDevbar: IDevbar = {
	time() {},
	timeEnd() {},
	addContext() {},
	add() {},
	register() {},
	start(next) {
		return next()
	},
	clone() {
		return MockDevbar
	},
	containers: {},
	current: null,
	isEnabled: false,
	isMock: true,
	on() {},
	emit() {},
}
