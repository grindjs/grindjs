import './CacheProvider'
import './ConfigBuilder'

function Config(...args) {
	Log.error('WARNING: Config has been renamed to ConfigBuilder and will be removed in 0.7')
	return ConfigBuilder(...args)
}

export {
	CacheProvider,
	ConfigBuilder,

	// Legacy
	Config
}
