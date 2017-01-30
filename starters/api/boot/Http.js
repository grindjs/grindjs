import { HttpServer } from 'grind-framework'

(new HttpServer(() => require('App/Bootstrap'))).start().catch(err => {
	Log.error('Boot Error', err)
	process.exit(1)
})
