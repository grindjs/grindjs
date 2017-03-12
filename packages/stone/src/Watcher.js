export class Watcher {
	engine = null
	watcher = null

	constructor(engine, viewPath) {
		this.engine = engine
		this.watcher = require('chokidar').watch(viewPath)
	}

	start() {
		this.watcher.on('ready', () => {
			this.watcher.on('all', (type, path) => {
				delete this.engine.compiler.compiled[path]
			})
		})
	}

	stop() {
		return Promise.resolve(this.watcher.close())
	}

}
