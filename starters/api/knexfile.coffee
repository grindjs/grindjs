app = require('./app/boot')
config = require('grind-db').config(app)
config.pool = { max: 1 }
module.exports = config
