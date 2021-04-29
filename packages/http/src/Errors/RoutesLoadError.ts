export class RoutesLoadError extends Error {
	cause?: Error | null

	constructor(err: string | Error, message?: string) {
		super(typeof err === 'string' ? err : message)

		this.name = this.constructor.name
		this.cause = typeof err === 'string' ? null : err
	}
}
