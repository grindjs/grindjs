import { Model as ObjectionModel } from 'objection'

import './RelationSynchronizer'
import './RelationValidator'
import './inflect'

const as = require('as-type')

export class Model extends ObjectionModel {
	static descriptiveName = null
	static eager = null
	static eagerFilters = [ ]

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
					reject(new NotFoundError(`${this.describe()} Not found`))
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
		foreignKey = foreignKey || inflect.foreignKey(this.name)
		localKey = localKey || this.idColumn

		return {
			relation: relation,
			modelClass: modelClass,
			join: {
				from: `${modelClass.tableName}.${foreignKey}`,
				to: `${this.tableName}.${localKey}`
			}
		}
	}

	static belongsTo(modelClass, foreignKey = null, otherKey = null) {
		foreignKey = foreignKey || inflect.foreignKey(modelClass.name)
		otherKey = otherKey || modelClass.idColumn

		return {
			relation: this.BelongsToOneRelation,
			modelClass: modelClass,
			join: {
				from: `${this.tableName}.${foreignKey}`,
				to: `${modelClass.tableName}.${otherKey}`
			}
		}
	}

	static belongsToMany(modelClass, tableName = null, foreignKey = null, otherKey = null) {
		tableName = tableName || [ this.tableName, modelClass.tableName ].sort().join('_')
		foreignKey = foreignKey || inflect.foreignKey(modelClass.name)
		otherKey = otherKey || inflect.foreignKey(this.name)

		return {
			relation: this.ManyToManyRelation,
			modelClass: modelClass,
			join: {
				from: `${this.tableName}.${this.idColumn}`,
				through: {
					from: `${tableName}.${otherKey}`,
					to: `${tableName}.${foreignKey}`
				},
				to: `${modelClass.tableName}.${modelClass.idColumn}`
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
		const schema = this.constructor.jsonSchema

		if(schema.isNil || schema.properties.isNil) {
			return json
		}

		for(const field of Object.keys(schema.properties)) {
			if(typeof json[field] === 'undefined') {
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

	$beforeValidate(jsonSchema, json, opt) {
		const properties = jsonSchema.properties || { }

		for(const field of Object.keys(properties)) {
			const value = json[field]

			if(value.isNil) {
				continue
			}

			const fieldType = properties[field].type

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
			const now = (new Date).toISOString()
			this.updated_at = now

			if(inserting) {
				this.created_at = now
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

	static describe() {
		if(!this.descriptiveName.isNil) {
			return this.descriptiveName
		}

		return inflect.singular(this.tableName)
	}

}
