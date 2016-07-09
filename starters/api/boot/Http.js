import {HttpServer} from 'grind-framework'

(new HttpServer(() => require('App/Bootstrap'))).start()
