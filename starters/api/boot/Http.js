import {HttpServer} from 'grind-framework'

(new HttpServer(() => require('App/Boot'))).start()
