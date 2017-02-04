import './CacheProvider'
import './ConfigBuilder'
import './CacheBuilder'

function Config(...args) {
	Log.error('WARNING: Config has been renamed to ConfigBuilder and will be removed in 0.7')
	return ConfigBuilder(...args)
}

export {
	CacheBuilder,
	CacheProvider,
	ConfigBuilder,

	// Legacy
	Config
}
