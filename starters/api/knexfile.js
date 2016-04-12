var app = require('./app/boot')
var config = require('grind-db').config(app)
config.pool = { min: 1, max: 1 }
module.exports = config
