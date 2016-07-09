import {CliProvider} from 'grind-cli'
import 'App/Providers/CommandsProvider'

const app = require('App/Bootstrap')
app.providers.unshift(CliProvider, CommandsProvider)

app.boot()
app.get('cli').run()
