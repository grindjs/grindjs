//
// WARNING: This file is *NOT* processed through babel
//

require('@babel/register')
require('@grindjs/framework')

const { HttpServer, HttpKernel } = require('@grindjs/http')

new HttpServer(() => require('../app/Bootstrap').Bootstrap(HttpKernel)).start().catch(err => {
	Log.error('Boot Error', err)
	process.exit(1)
})
