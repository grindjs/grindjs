import 'babel-polyfill'
import 'grind-framework'

import { CliProvider } from 'grind-cli'
import 'App/Providers/CommandsProvider'

const app = require('App/Bootstrap')
app.providers.push(CliProvider, CommandsProvider)

app.boot().then(() => app.cli.run()).catch(err => {
	Log.error('Boot Error', err)
	process.exit(1)
})
