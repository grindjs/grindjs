const app = require('./app/boot')
const config = require('grind-db').config(app)
config.pool = { min: 1, max: 1 }
module.exports = config
