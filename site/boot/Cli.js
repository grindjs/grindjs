import {CliProvider} from 'grind-cli'
import 'App/Providers/CommandsProvider'

const app = require('App/Bootstrap')
app.providers.push(CliProvider, CommandsProvider)

app.boot().then(() => app.cli.run())
