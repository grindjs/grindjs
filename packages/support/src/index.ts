import { lazy } from './lazy'

module.exports = {
	lazy,
}

lazy(module.exports, 'FS', () => require('./FS').FS)
lazy(module.exports, 'Inflect', () => require('./Inflect').Inflect)
lazy(module.exports, 'merge', () => require('./merge').merge)
lazy(module.exports, 'Obj', () => require('./Obj').Obj)
lazy(module.exports, 'Str', () => require('./Str').Str)
lazy(module.exports, 'Watcher', () => require('./Watcher').Watcher)
