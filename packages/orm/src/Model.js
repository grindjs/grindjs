import { Model as ObjectionModel } from 'objection'

import './inflect'

export class Model extends ObjectionModel {

	static primaryKey = 'id'
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
		return this.query().where('id', id).first()
	}

	static findByRouteParameter(value) {
		return this.findById(value)
	}

	static routeBind(name, description) {
		description = description || `${name} Value`

		this.app().routes.bind(name, (value, resolve, reject) => {
			this.findByRouteParameter(value).then(row => {
				if(row.isNil) {
					reject(new NotFoundError(`${name} Not found`))
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
		localKey = localKey || this.primaryKey

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
		otherKey = otherKey || modelClass.primaryKey

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
				from: `${this.tableName}.${this.primaryKey}`,
				through: {
					from: `${tableName}.${otherKey}`,
					to: `${tableName}.${foreignKey}`
				},
				to: `${modelClass.tableName}.${modelClass.primaryKey}`
			}
		}
	}

	$beforeSave(inserting) {
		return new Promise(resolve => {
			const now = (new Date).toISOString()
			this.updated_at = now

			if(inserting) {
				this.created_at = now
			}

			resolve()
		})
	}

	$beforeInsert() {
		return this.$beforeSave(true)
	}

	$beforeUpdate() {
		return this.$beforeSave(false)
	}

}
