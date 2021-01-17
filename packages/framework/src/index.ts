import './Global'

import { Application } from './Application'
import { Log } from './Log'

export { Application, Log }
export default Application

export { Config } from './Config'
export { Kernel } from './Kernel'
export * from './Errors'
export { MissingPackageError } from './Errors/MissingPackageError'
export { Paths } from './Paths'
export { Provider } from './Provider'

if (global.Log === undefined || global.Log === null) {
	global.Log = Log
}
