export class StatesRepository {
	db = null

	constructor(db) {
		this.db = db
	}

	all(limit, offset, term, callback) {
		if(typeof term === 'function') {
			callback = term
			term = null
		}

		var query = this.db('states').orderBy('abbreviation', 'asc').limit(limit).offset(offset)

		if(!term.isNil) {
			query.where('name', 'like', '%' + term + '%').orWhere('abbreviation', 'like', '%' + term + '%')
		}

		query.after((err, rows) => {
			if(!rows.isNil && rows.length > 0) {
				callback(rows)
			} else {
				callback(rows)
			}
		})

		return
	}

	find(abbreviation, callback) {
		this.db('states').where('abbreviation', abbreviation).limit(1).after((err, rows) => {
			if(rows && rows.length > 0) {
				callback(rows[0])
			} else {
				callback(null)
			}
		})
	}

}
