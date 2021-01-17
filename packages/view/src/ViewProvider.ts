import Application, { Provider } from '@grindjs/framework'

import { ViewCacheCommand } from './ViewCacheCommand'
import { ViewClearCommand } from './ViewClearCommand'
import { ViewFactory } from './ViewFactory'

const ViewProvider: Provider = async function (app: Application) {
	app.view = new ViewFactory(app)
	await app.view.bootstrap()

	// TODO: Fix once @grindjs/http has been converted
	;(app as any).routes?.use((req: any, res: any, next: any) => {
		res.locals.url = (app as any).url!.clone(req)
		next()
	})

	app.cli?.register(ViewCacheCommand)
	app.cli?.register(ViewClearCommand)
}

ViewProvider.shutdown = app => app.view!.shutdown()
ViewProvider.priority = 30000

export { ViewProvider }
