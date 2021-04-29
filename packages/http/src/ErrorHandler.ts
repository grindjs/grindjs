import { Application } from '@grindjs/framework'
import { Request, Response } from 'express'

export type ErrorHandlerParsedError = { code: number; error: string }

export type ErrorHandlerProcessor = (
	error: Error,
	req: Request,
	res: Response,
) => Partial<ErrorHandlerParsedError>

export class ErrorHandler {
	processors: { errorClass: any; processor: ErrorHandlerProcessor }[] = []
	shouldntReport: any[] = []

	constructor(public app: Application) {
		this.shouldntReport.push(HttpError)
		this.register(HttpError, err => ({
			code: (err as any).status || 500,
			error: err.message,
		}))
	}

	register(errorClass: any, processor: ErrorHandlerProcessor) {
		for (const entry of this.processors) {
			if (entry.errorClass !== errorClass) {
				continue
			}

			entry.processor = processor
			return
		}

		this.processors.push({ errorClass, processor })
	}

	handle(err: Error, req: Request, res: Response, next: (error: any) => void) {
		if (res.headersSent) {
			return next(err)
		}

		const info: Partial<ErrorHandlerParsedError & { stack: string[] }> = {}
		const processor = this.processors.find(entry => err instanceof entry.errorClass)?.processor

		if (processor) {
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

		if (!info.code) {
			info.code = 500
		}

		if (!info.error) {
			info.error = 'Internal server error'
		}

		if (this.app!.debug) {
			info.stack = err.stack?.split(/\n+/) ?? []
		}

		const report = this.shouldReport(err) ? this.report(req, res, err, info) : Promise.resolve()
		return report.then(() => this.render(req, res, err, info))
	}

	_internalProcessor(info: Partial<ErrorHandlerParsedError>, err: Error) {
		info.code = (err as any).status

		if (this.app!.debug) {
			info.error = err.message || info.error
		}
	}

	shouldReport(err: Error) {
		return this.shouldntReport.findIndex(errorClass => err instanceof errorClass) === -1
	}

	report(req: Request, res: Response, err: Error, info: Partial<ErrorHandlerParsedError>) {
		Log.error('Error in request %s', req.path, err.stack, info)
		return Promise.resolve()
	}

	render(req: Request, res: Response, err: Error, info: Partial<ErrorHandlerParsedError>) {
		this.renderJson(req, res, err, info)
	}

	renderView(
		req: Request,
		res: Response,
		err: Error,
		info: Partial<ErrorHandlerParsedError>,
		view: string,
	) {
		if (!(this.app as any)?.view) {
			Log.error('Unable to render view, `@grindjs/view` is not loaded.')
			return this.renderJson(req, res, err, info)
		}

		res.status(info.code ?? 500)
		res.render(view, { err, info })
	}

	renderJson(req: Request, res: Response, err: Error, info: Partial<ErrorHandlerParsedError>) {
		res.status(info.code ?? 500)
		res.send(info)
	}
}
