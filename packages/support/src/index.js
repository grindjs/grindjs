import './lazy'

module.exports = {
	lazy
}

lazy(module.exports, 'FS', () => require('./FS.js').FS)
lazy(module.exports, 'Inflect', () => require('./Inflect.js').Inflect)
lazy(module.exports, 'merge', () => require('./merge.js').merge)
lazy(module.exports, 'Obj', () => require('./Obj.js').Obj)
lazy(module.exports, 'Str', () => require('./Str.js').Str)
lazy(module.exports, 'Watcher', () => require('./Watcher.js').Watcher)
