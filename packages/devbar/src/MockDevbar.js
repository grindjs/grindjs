/**
 * Mock Devbar class that provides the same interface as Devbar
 * but doesn’t actually do anything.
 *
 * This is used when app.debug is off, allowing instrumented code
 * to run unaffected in production.
 */
export const MockDevbar = {
	time: () => { },
	timeEnd: () => { },
	addContext: () => { },
	add: () => { },
	start: next => next(),
	clone: () => MockDevbar
}
