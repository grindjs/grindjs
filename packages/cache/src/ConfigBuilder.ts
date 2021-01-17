import { Application } from '@grindjs/framework'
import { StoreConfig } from 'cache-manager'

import * as DatabaseStore from './DatabaseStore'

export interface Config extends Record<string, any> {
	driver?: string
	path?: string
	connection?: string | Record<string, any> | null
	flat?: boolean
}

export interface ConfigBuilderType {
	(store: Config | string | null | undefined, app: Application, returnStoreName?: boolean):
		| StoreConfig
		| null
		| undefined
}

const ConfigBuilder: ConfigBuilderType = function (store, app, returnStoreName = false) {
	if (typeof store === 'string') {
		store = app.config.get(`cache.stores.${store}`) as Config | undefined
	}

	if (store === null || store === undefined) {
		return null
	} else {
		store = { ...store }
	}

	const driver = expandDriverAlias(store.driver || null)
	delete store.driver

	const result: Partial<StoreConfig> = {
		options: { ...expandStoreConfig(app, driver, store) },
	}

	if (result.options.flat === true) {
		Object.assign(result, result.options)
		delete result.options
		delete (result as any).flat
	}

	if (returnStoreName) {
		result.store = driver as any
	} else if (driver === 'database') {
		result.store = DatabaseStore
	} else if (driver === null || driver === undefined) {
		result.store = 'memory'
	} else {
		result.store = require(driver)
	}

	return result as StoreConfig
}

export { ConfigBuilder }

export function expandDriverAlias(alias: string | null | undefined): string | null {
	if (typeof alias !== 'string') {
		return null
	}

	switch (alias.toLowerCase()) {
		case 'db':
		case 'database':
			return 'database'
		case 'memcache':
		case 'memcached':
			return 'cache-manager-memcached-store'
		case 'redis':
			return 'cache-manager-redis'
		case 'mongo':
		case 'mongodb':
			return 'cache-manager-mongodb'
		case 'mongoose':
			return 'cache-manager-mongoose'
		case 'fs':
		case 'file':
		case 'files':
		case 'filesystem':
			return 'cache-manager-fs'
		case 'fs-binary':
			return 'cache-manager-fs-binary'
		case 'mem':
		case 'memory':
		case 'in-memory':
		case 'lru':
			return null
		default:
			return alias
	}
}

export function expandStoreConfig(app: Application, driver: string | null, config: Config) {
	switch (driver) {
		case 'cache-manager-redis':
			return expandRedisStoreConfig(app, driver, config)
		case 'database':
			return expandDatabaseStoreConfig(app, driver, config)
	}

	if (typeof config.path === 'string') {
		config.path = app.paths.base(config.path)
	}

	return config
}

function expandRedisStoreConfig(app: Application, driver: string | null, config: Config) {
	if (config.connection === undefined) {
		return config
	}

	let connection = config.connection
	delete config.connection

	if (connection === null) {
		connection = app.config.get('redis.default', null) as string | null
	}

	if (typeof connection === 'string') {
		connection = app.config.get(`redis.connections.${connection}`) as Record<string, any> | null
	}

	if (connection === null || connection === undefined) {
		return config
	}

	config = { ...config, ...connection, flat: true }
	delete config.driver

	if (config.password !== void 0 && config.auth_pass === void 0) {
		config.auth_pass = config.password
		delete config.password
	}

	if (config.host === void 0) {
		config.host = 'localhost'
	}

	if (config.port === void 0) {
		config.port = 6379
	}

	return config
}

function expandDatabaseStoreConfig(app: Application, driver: string | null, config: Config) {
	if (config.connection === undefined) {
		return config
	}

	let connection = config.connection
	delete config.connection

	if (connection === null) {
		connection = (app as any).db
	} else {
		if (typeof connection === 'string') {
			connection = app.config.get(`database.connections.${connection}`) as any
		}

		if (typeof connection === 'object') {
			const DatabaseBuilder = require('@grindjs/db').DatabaseBuilder
			connection = DatabaseBuilder(connection, app)
		} else {
			connection = null
		}
	}

	if (connection === null || connection === undefined) {
		return config
	}

	config = { ...config, connection }
	delete config.driver

	return config
}
