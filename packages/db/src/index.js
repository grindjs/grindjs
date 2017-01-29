import './ConfigBuilder'
import './DatabaseBuilder'
import './DatabaseProvider'

const Config = ConfigBuilder
const Database = DatabaseBuilder

export {
	ConfigBuilder,
	DatabaseBuilder,
	DatabaseProvider,

	// Legacy names
	Config,
	Database
}
