Grind = require 'grind'
app = new Grind

app.providers.push require('grind-db').provider
app.providers.push require('grind-swagger').provider
app.providers.push require('./providers/routes')

module.exports = app
