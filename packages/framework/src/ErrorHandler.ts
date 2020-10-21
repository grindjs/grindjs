import { IncomingMessage, ServerResponse } from 'http'

import { Application } from './Application'
import { HttpError } from './Errors/HttpError/HttpError'

export interface ErrorInfo extends Record<string, any> {
	error?: string
	code?: number
}

export type ErrorProcessorFunc = (
	err: any,
	req: IncomingMessage,
	res: ServerResponse,
) => Partial<ErrorInfo>

interface ErrorProcessor {
	errorClass: any
	processor: ErrorProcessorFunc
}

type NextFunction = (err?: any) => void

export class ErrorHandler {
	processors: ErrorProcessor[] = []
	shouldntReport: any[] = []

	constructor(public app: Application) {
		this.shouldntReport.push(HttpError)
		this.register(HttpError, err => ({
			code: err.status || 500,
			error: err.message,
		}))
	}

	register(errorClass: any, processor: ErrorProcessorFunc) {
		for (const entry of this.processors) {
			if (entry.errorClass !== errorClass) {
				continue
			}

			entry.processor = processor
			return
		}

		this.processors.push({ errorClass, processor })
	}

	handle(err: any, req: IncomingMessage, res: ServerResponse, next: NextFunction) {
		if (res.headersSent) {
			return next(err)
		}

		const info: ErrorInfo = {}
		let processor = null

		for (const entry of this.processors) {
			if (!(err instanceof entry.errorClass)) {
				continue
			}

			processor = entry.processor
			break
		}

		if (typeof processor === 'function') {
			try {
				const result = processor(err, req, res)

				if (res.headersSent) {
					return
				}

				Object.assign(info, result)
			} catch (err2) {
				err = err2
				this._internalProcessor(info, err)
			}
		} else {
			this._internalProcessor(info, err)
		}

		if (typeof info.code !== 'number') {
			info.code = 500
		}

		if (!info.error) {
			info.error = 'Internal server error'
		}

		if (this.app.debug) {
			info.stack = err.stack.split(/\n+/)
		}

		const report = this.shouldReport(err) ? this.report(req, res, err, info) : Promise.resolve()
		return report.then(() => this.render(req, res, err, info))
	}

	_internalProcessor(info: ErrorInfo, err: any) {
		info.code = err.status

		if (this.app.debug) {
			info.error = err.message || info.error
		}
	}

	shouldReport(err: any) {
		return this.shouldntReport.findIndex(errorClass => err instanceof errorClass) === -1
	}

	report(req: IncomingMessage, res: ServerResponse, err: any, info: ErrorInfo) {
		Log.error('Error in request %s', (req as any).path, err.stack, info)
		return Promise.resolve()
	}

	render(req: IncomingMessage, res: ServerResponse, err: any, info: ErrorInfo) {
		this.renderJson(req, res, err, info)
	}

	renderView(req: IncomingMessage, res: ServerResponse, err: any, info: ErrorInfo, view: string) {
		if ((this.app as any).view.isNil) {
			Log.error('Unable to render view, `@grindjs/view` is not loaded.')
			return this.renderJson(req, res, err, info)
		}

		;(res as any)
			.status(info.code)(res as any)
			.render(view, { err, info })
	}

	renderJson(req: IncomingMessage, res: ServerResponse, err: any, info: ErrorInfo) {
		;(res as any)
			.status(info.code ?? 500)(res as any)
			.send(info)
	}
}
