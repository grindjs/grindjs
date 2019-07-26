import { Socket } from './Socket'
import { LiveReloader } from './LiveReloader/LiveReloader'

const socket = Socket()
LiveReloader(socket)
