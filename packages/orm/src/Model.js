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
