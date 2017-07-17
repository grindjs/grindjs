//
// WARNING: This file is *NOT* processed through babel
//

require('babel-register')
require('babel-polyfill')

const { HttpServer } = require('grind-framework')

new HttpServer(() => require('../app/Bootstrap')).start().catch(err => {
	Log.error('Boot Error', err)
	process.exit(1)
})
