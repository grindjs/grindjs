export class RelationSynchronizer {

	model = null
	modelClass = null
	relation = null
	relatedClass = null
	relatedColumn = null

	constructor(model, relation) {
		this.model = model
		this.modelClass = model.constructor
		this.relation = this.modelClass.getRelations()[relation]

		if(this.relation.isNil) {
			throw new BadRequestError('Invalid relation')
		}

		if(this.relation.ownerModelClass === this.modelClass) {
			this.relatedClass = this.relation.relatedModelClass
			this.relatedColumn = this.relation.relatedCol[0]
		} else {
			this.relatedClass = this.relation.ownerModelClass
			this.relatedColumn = this.relation.ownerCol[0]
		}
	}

	sync(ids, trx = null) {
		return this._relate(ids, true, trx)
	}

	relate(ids, trx = null) {
		return this._relate(ids, false, trx)
	}

	_relate(ids, replace, trx = null) {
		ids = this._parseIds(ids)

		return this.relatedClass.query(trx).whereIn(this.relatedColumn, ids).then(related => {
			if(related.isNil || related.length !== ids.length) {
				const plural = ids.length !== 1 ? 's' : ''
				throw new BadRequestError(`Invalid id${plural}`)
			}
		})
		.then(() => this.model.$relatedQuery(this.relation.name, trx))
		.then(models => models.map(model => model.id))
		.then(existing => {
			const additional = ids.filter(id => existing.indexOf(id) === -1)
			const promises = [ this._relateIds(additional, trx) ]

			if(replace) {
				promises.push(this._unrelateIds(
					existing.filter(id => ids.indexOf(id) === -1)
				), trx)
			}

			return Promise.all(promises)
		})
	}

	unrelate(ids, trx = null) {
		return this._unrelateIds(this._parseIds(ids), trx)
	}

	_relateIds(ids, trx = null) {
		return Promise.all(ids.map(id =>
			this.model.$relatedQuery(this.relation.name, trx).relate(id)
		))
	}

	_unrelateIds(ids, trx = null) {
		return this.model.$relatedQuery(this.relation.name, trx).unrelate()
		.whereIn(`${this.relatedClass.tableName}.${this.relatedColumn}`, ids)
	}

	_parseIds(ids) {
		if(!Array.isArray(ids)) {
			ids = ids.split(',')
		}

		return ids.map(value => {
			if(Number.isInteger(value)) {
				return value
			}

			const id = Number.parseInt(value.toString().trim())

			if(Number.isInteger(id) && id > 0) {
				return id
			} else {
				throw new BadRequestError(`Invalid id: ${value}`)
			}
		})
	}

}
