const as = require('as-type')

export function RelationValidator(model, queryContext) {
	const modelClass = model.constructor

	if(!modelClass.jsonSchema || !modelClass.jsonSchema.properties) {
		return Promise.resolve()
	}

	const properties = modelClass.jsonSchema.properties
	const relations = modelClass.getRelations()

	if(!relations || relations.length === 0) {
		return Promise.resolve()
	}

	const promises = [ ]
	const transaction = (queryContext || { }).transaction || model.$knex()

	for(const field of Object.keys(properties)) {
		if(typeof model[field] === 'undefined') {
			continue
		}

		const property = properties[field]

		if(typeof property.relation !== 'string') {
			continue
		}

		const value = model[field]

		if(as.integer(value) <= 0) {
			model[field] = null
			continue
		}

		const relation = relations[property.relation]

		let foreignTable = null
		let foreignColumn = null

		if(relation.ownerModelClass === modelClass) {
			foreignTable = relation.relatedModelClass.tableName
			foreignColumn = relation.relatedProp.cols[0]
		} else {
			foreignTable = relation.ownerModelClass.tableName
			foreignColumn = relation.ownerProp.cols[0]
		}

		promises.push(transaction(foreignTable).where(foreignColumn, value).first().then(row => {
			if(!row.isNil) {
				return
			}

			throw new ValidationError({
				data: {
					[field]: `Could not find ${relation.name.replace(/_/g, ' ')} for ${model[field]}`
				}
			})
		}))
	}

	return promises.length > 0 ? Promise.all(promises) : Promise.resolve()
}
