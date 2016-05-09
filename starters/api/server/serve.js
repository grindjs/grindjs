const app = require('App/Boot')
const port = app.config.get('app.port', 3000)

app.listen(port, () => {
	console.log('Listening on port %d', port)
})
