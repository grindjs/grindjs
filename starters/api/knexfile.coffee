app = require('./app/boot')
config = require('grind-db').config(app)
config.pool = { min: 1, max: 1 }
module.exports = config
