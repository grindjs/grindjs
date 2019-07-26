import { Socket } from './Socket'
import { LiveReloader } from './LiveReloader/LiveReloader'

const context = {
	errors: { }
}

context.socket = Socket(document.currentScript)
LiveReloader(context)

context.socket.on('error', (_, error) => {
	context.errors[error.id] = error
})

window.$grindAssets = Object.freeze(context)
