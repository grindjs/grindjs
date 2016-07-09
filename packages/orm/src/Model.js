import { Model as ObjectionModel } from 'objection'

export class Model extends ObjectionModel {

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
