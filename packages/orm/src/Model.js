import { Model as ObjectionModel } from 'objection'

import './Inflect'
import './ModelNotFoundError'
import './RelationSynchronizer'
import './RelationValidator'

const as = require('as-type')

export class Model extends ObjectionModel {
	static descriptiveName = null
	static eager = null
	static eagerFilters = null
	static useTimestamps = true
	static createdAt = 'created_at'
	static updatedAt = 'updated_at'
	static dates = [ ]

	static $$app = null

	static app(app) {
		if(!app.isNil) {
			this.$$app = app
		} else {
			return this.$$app
		}
	}

	$app() {
		return this.constructor.app()
	}

	static findById(id) {
		return this.query().findById(id)
	}

	static findByRouteParameter(value) {
		return this.findById(value)
	}

	static routeBind(name, description) {
		description = description || `${name} Value`

		this.app().routes.bind(name, (value, resolve, reject) => {
			this.findByRouteParameter(value).then(row => {
				if(row.isNil) {
					reject(new ModelNotFoundError(this))
					return
				}

				resolve(row)
			})
		}, { swagger: { name, description } })
	}

	static buildRelations() {
		return { }
	}

	static getRelations() {
		if(this.relationMappings.isNil) {
			this.relationMappings = this.buildRelations()
		}

		return super.getRelations()
	}

	static hasOne(modelClass, foreignKey = null, localKey = null) {
		return this._hasOneOrMany(this.HasOneRelation, modelClass, foreignKey, localKey)
	}

	static hasMany(modelClass, foreignKey = null, localKey = null) {
		return this._hasOneOrMany(this.HasManyRelation, modelClass, foreignKey, localKey)
	}

	static _hasOneOrMany(relation, modelClass, foreignKey = null, localKey = null) {
		foreignKey = foreignKey || Inflect.foreignKey(this.name)

		if(localKey.isNil) {
			localKey = this.getFullIdColumn()
		} else {
			localKey = `${this.tableName}.${localKey}`
		}

		return {
			relation: relation,
			modelClass: modelClass,
			join: {
				from: `${modelClass.tableName}.${foreignKey}`,
				to: localKey
			}
		}
	}

	static belongsTo(modelClass, foreignKey = null, otherKey = null) {
		foreignKey = foreignKey || Inflect.foreignKey(modelClass.name)

		if(otherKey.isNil) {
			otherKey = modelClass.getFullIdColumn()
		} else {
			otherKey = `${modelClass.tableName}.${otherKey}`
		}

		return {
			relation: this.BelongsToOneRelation,
			modelClass: modelClass,
			join: {
				from: `${this.tableName}.${foreignKey}`,
				to: otherKey
			}
		}
	}

	static belongsToMany(modelClass, tableName = null, foreignKey = null, otherKey = null) {
		tableName = tableName || [ this.tableName, modelClass.tableName ].sort().join('_')
		foreignKey = foreignKey || Inflect.foreignKey(modelClass.name)
		otherKey = otherKey || Inflect.foreignKey(this.name)

		return {
			relation: this.ManyToManyRelation,
			modelClass: modelClass,
			join: {
				from: this.getFullIdColumn(),
				through: {
					from: `${tableName}.${otherKey}`,
					to: `${tableName}.${foreignKey}`
				},
				to: modelClass.getFullIdColumn()
			}
		}
	}

	$sync(relation, ids) {
		return (new RelationSynchronizer(this, relation)).sync(ids)
	}

	$relate(relation, ids) {
		return (new RelationSynchronizer(this, relation)).relate(ids)
	}

	$unrelate(relation, ids) {
		return (new RelationSynchronizer(this, relation)).unrelate(ids)
	}

	$parseDatabaseJson(json) {
		json = super.$parseDatabaseJson(json)

		for(const date of this.constructor.getDates()) {
			if(json[date].isNil) {
				continue
			}

			json[date] = this.constructor.asDate(json[date])
		}

		const schema = this.constructor.jsonSchema

		if(schema.isNil || schema.properties.isNil) {
			return json
		}

		for(const field of Object.keys(schema.properties)) {
			if(json[field].isNil) {
				continue
			}

			if(Number.isNaN(json[field])) {
				json[field] = null
				continue
			}

			const property = schema.properties[field]

			// Boolean values can be converted to JSON as "0"/"1", convert back to boolean
			if(property.type === 'boolean') {
				json[field] = as.boolean(json[field])
			}

			// Number values can be converted to JSON as strings, convert back to numbers
			if(property.type === 'number' || property.type === 'float' || property.type === 'double') {
				json[field] = as.float(json[field])
			} else if(property.type === 'integer') {
				json[field] = as.integer(json[field])
			}
		}

		return json
	}

	$formatDatabaseJson(json) {
		json = super.$formatDatabaseJson(json)

		for(const date of this.constructor.getDates()) {
			if(json[date].isNil) {
				continue
			}

			json[date] = this.constructor.asDatabaseDate(json[date])
		}

		return json
	}

	$beforeValidate(jsonSchema, json, opt) {
		const properties = jsonSchema.properties || { }

		for(const field of Object.keys(properties)) {
			const value = json[field]

			if(value.isNil) {
				continue
			}

			const property = properties[field]
			let fieldType = property.type
			let allowsNull = false

			if(!property.anyOf.isNil) {
				fieldType = property.anyOf.map(type => type.type)
			}

			if(Array.isArray(fieldType) && fieldType.length > 1) {
				allowsNull = fieldType.indexOf('null') >= 0
				fieldType = fieldType.filter(type => type !== 'null')[0]
			}

			if(allowsNull && typeof value === 'string' && value.length === 0) {
				json[field] = null
				continue
			}

			if(fieldType === 'boolean') {
				json[field] = as.boolean(json[field])
			} else if(fieldType === 'integer') {
				json[field] = as.integer(json[field])
			} else if(fieldType === 'number' || fieldType === 'float' || fieldType === 'double') {
				json[field] = as.float(json[field])
			}
		}

		return super.$beforeValidate(jsonSchema, json, opt)
	}

	$beforeSave(inserting) {
		return new Promise(resolve => {
			if(this.constructor.useTimestamps) {
				const now = new Date
				this[this.constructor.updatedAt] = now

				if(inserting) {
					this[this.constructor.createdAt] = now
				}
			}

			resolve()
		}).then(() => RelationValidator(this))
	}

	$beforeInsert() {
		return this.$beforeSave(true)
	}

	$beforeUpdate() {
		return this.$beforeSave(false)
	}

	static getDates() {
		if(this.useTimestamps) {
			return [ ...this.dates, this.createdAt, this.updatedAt ]
		}

		return this.dates
	}

	static asDate(value) {
		return new Date(value)
	}

	static asDatabaseDate(value) {
		if(value instanceof Date) {
			return value
		}

		return new Date(value)
	}

	static describe() {
		if(!this.descriptiveName.isNil) {
			return this.descriptiveName
		}

		const name = Inflect.singularize(this.tableName)
		return name.charAt(0).toUpperCase() + name.substring(1)
	}

}
