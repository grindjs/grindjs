import { Application } from './Application'
import { Log } from './Log'

export { Application, Log }
export default Application

export { Config } from './Config'
export { Kernel } from './Kernel'
export * from './Errors'
export { MissingPackageError } from './Errors/MissingPackageError'
export { Paths } from './Paths'

// Prior to 0.8, Application was Grind
// Exporting Grind alias for legacy purposes
export const Grind = Application

if(global.Log.isNil) {
	global.Log = Log
}
