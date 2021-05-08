import '@grindjs/http'

import path from 'path'

import { Application, Provider } from '@grindjs/framework'
import { Request, Response } from 'express'

import { DatabaseCollector } from './Collectors/DatabaseCollector'
import { ViewCollector } from './Collectors/ViewCollector'
import { Devbar } from './Devbar'
import { IDevbar } from './IDevbar'
import { MockDevbar } from './MockDevbar'

export const DevbarProvider: Provider = (
	app,
	{ devbarClass = Devbar, loadDevbar = _loadDevbar, cloneDevbar = _cloneDevbar } = {},
) => {
	loadDevbar(app, devbarClass)

	if (app.devbar?.isMock !== true) {
		app.routes!.static('__devbar', path.join(__dirname, '../resources/assets'))
	}

	app.routes!.use((req, res, next) => {
		const devbar = (cloneDevbar || _cloneDevbar)((req.app as any)._grind, req, res)

		req.devbar = devbar
		res.devbar = devbar
		res.locals.devbar = devbar

		if (!devbar.isEnabled) {
			return next()
		}

		require('zone.js/dist/zone-node.js')
		;((global as unknown) as any).Zone.current
			.fork({
				properties: {
					devbar: devbar,
					id: Math.random(),
				},
			})
			.run(() => devbar.start(next))
	})
}

function _loadDevbar(app: Application, devbarClass: new (app: Application) => IDevbar) {
	if (app.debug) {
		app.devbar = new devbarClass(app)
		app.devbar.register(DatabaseCollector)
		app.devbar.register(ViewCollector)
	} else {
		app.devbar = { ...MockDevbar }
	}
}

function _cloneDevbar(app: Application, req: Request, res: Response) {
	return app.devbar!.clone(req, res)
}

DevbarProvider.priority = 1000

declare module '@grindjs/framework' {
	interface Application {
		devbar?: IDevbar
	}
}

declare module 'express' {
	interface Request {
		devbar?: IDevbar
	}
	interface Response {
		devbar?: IDevbar
	}
}
