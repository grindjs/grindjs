# Models & ORM
Grind’s ORM is powered by [Objection.js](http://vincit.github.io/objection.js) which provides full ES6/7 class based Models.

This document only focuses on additional functionality Grind ORM provides on top of Objection.js, for full documentation on how Objection.js works, head over to [vincit.github.io/objection.js](http://vincit.github.io/objection.js).

[[toc]]

## Installation
First, add the `grind-orm` package via your preferred package manager:

```shell
yarn add grind-orm
```

Next, you’ll need to add `OrmProvider` to your app providers in `app/Boostrap.js`:

```js
import Grind from 'grind-framework'
import { OrmProvider } from 'grind-orm'

const app = new Grind()
app.providers.push(OrmProvider)
```

## Building Models
### Model Generator
The fastest way to create a new model is by using the model generator via `bin/cli make:model`.

You can invoke `make:model` with a few different arguments:

* `bin/cli make:model UserModel` will create `app/Models/UserModel.js`, but will not infer a table name.
* `bin/cli make:model --table=users` will also create `app/Models/UserModel.js` and will set the table name for you.
* You can also pass both a class name and a command name at the same time if your class name differs from the table name.

### Model Class
Once you’ve triggered `make:model`, a model is generated for you that looks like this:

```js
import { Model } from 'grind-orm'

export class UserModel extends Model {
	static tableName = 'users'
	static descriptiveName = 'user'

	static jsonSchema = {
		type: 'object',
		required: [ 'name' ],

		properties: {
			id: { type: 'integer' },
			name: { type: 'string', maxLength: 255 },
			created_at: { type: 'string', format: 'date-time' },
			updated_at: { type: 'string', format: 'date-time' }
		}
	}

	static buildRelations() {
		return {
			// children: this.hasMany(ChildModel)
		}
	}

}
```

---

#### tableName
This is the name of the table this model represents and tells the query builder which table to query on.

---

#### descriptiveName
This is used by the `describe` function throughout the framework to describe what this model represents, most prevalently in error messages.  If `descriptiveName` is not provided, the Model class will generate one based on the `tableName`.

---

#### jsonSchema
This is used by Objection.js to validate data going into your database.  It’s not required but highly recommended to ensure your data looks like it’s supposed to.

> {note} The `jsonSchema` properties are not tied directly to the database schema.  They’re solely intended for validation and will not be used to generate migrations.  You are still responsible for building out the backing database schema the model represents.

---

#### buildRelations
This function is called by Grind’s Model to populate the [`relationMappings` property](http://vincit.github.io/objection.js/#relationmappings) in Objection.js.  Using `buildRelations` has numerous benefits over `relationMappings`, which you can find below.

## Establishing Relationships
Grind’s Model offers a more concise way to establish relationships compared to Objection.js’s [`relationMappings` property](http://vincit.github.io/objection.js/#relationmappings), which can get fairly verbose and repetitive.

Grind has a `buildRelations` function where you return an object of relations that are then used to populate the `relationMappings` class property.

### Relationship Helpers
Grind’s Model offers several functions to help build relations:

#### hasOne
`hasOne` establishes a one to one relationship where the target model has a property that references a property of the local model.

```js
hasOne(modelClass, foreignKey = null, localKey = null)
```

###### Parameters
* `modelClass` — Target model you’re establishing a relationship with
* `foreignKey` — The property on the target model that references the local model.  If not provided, Model will generate a foreign key based on the local model’s name, `UserModel` becomes `user_id`.
* `localKey` — The property that `foreignKey` references on the local model.  If no value is provided, it uses the local model’s `idColumn` property, which defaults to `id`.

If `UserModel` calls `this.hasOne(AvatarModel)` it establishes that `AvatarModel` has a ` user_id` property that references `id` on `UserModel`.

---

#### hasMany
`hasMany` establishes a one to many relationship where the target model has a property that references a property of the local model.

```js
hasMany(modelClass, foreignKey = null, localKey = null)
```

###### Parameters
* `modelClass` — Target model you’re establishing a relationship with
* `foreignKey` — The property on the target model that references the local model.  If not provided, Model will generate a foreign key based on the local model’s name, `UserModel` becomes `user_id`.
* `localKey` — The property that `foreignKey` references on the local model.  If no value is provided, it uses the local model’s `idColumn` property, which defaults to `id`.

If `UserModel` calls `this.hasMany(PostModel)` it establishes that `PostModel` has a ` user_id` property that references `id` on `UserModel`.

---

#### belongsTo

`belongsTo` is the inverse of `hasOne`/`hasMany` and establishes a one to one relationship where the local model has a property that references a property of the target model.

```js
belongsTo(modelClass, foreignKey = null, otherKey = null)
```

###### Parameters
* `modelClass` — Target model you’re establishing a relationship with
* `foreignKey` — The property on the target model that references the local model.  If not provided, the Model will generate a foreign key based on the local model’s name, `UserModel` becomes `user_id`.
* `otherKey` — The property that `foreignKey` references on the target class.  If no value is provided, it uses the target models `idColumn` property, which defaults to `id`.

If `PostModel` calls `this.belongsTo(UserModel)` it establishes that `PostModel` has a ` user_id` property that references `id` on `UserModel`.

---

#### belongsToMany

`belongsToMany` establishes a many to many relationship using a join table.

```js
belongsToMany(modelClass, tableName = null, foreignKey = null, otherKey = null)
```

###### Parameters
* `modelClass` — Target model you’re establishing a relationship with
* `tableName` — Name of the join table to connect the two models.  If not provided, the Model will generate a table name based on the names of the tables on each end, sorted ascendingly and joined with an underscore. If you’re establishing a relationship between `UserModel` and `BlogModel` the default join table name will be `blogs_users`.
* `foreignKey` — The column on the join table that references the target model.  If not provided, the Model will generate a foreign key based on the target model’s name, `BlogModel` becomes `blog_id`.
* `otherKey` — The column on the join table that references the local model.  If not provided, the Model will generate a foreign key based on the local model’s name, `UserModel` becomes `user_id`.

###### Usage

If `UserModel` calls `this.belongsToMany(BlogModel)` it established that `UserModel` is connected to `BlogModel` through a joint able called `blogs_users` with `blogs_users.user_id` referencing `UserModel.idColumn` and `blogs_users.blog_id` referencing `BlogModel.idColumn`.

If wanted to establish a `followers` relationship, you could define it as:

```js
this.belongsToMany(UserModel, 'followers', 'to_user_id', 'from_user_id')
```

This would establish that one `UserModel` is related to another `UserModel` through a `followers` join table.

## Example
Putting it all together, here’s an example of creating a few relationships using the standard `relationMappings` from Objection.js compared to the same relationships built with Grind Model’s `buildRelations`:

### relationMappings
```js
import { Model } from 'grind-orm'

export class UserModel extends Model {

	static relationMappings = {
		avatar: {
			relation: Model.HasOneRelation,
			modelClass: AvatarModel,
			join: {
				from: `${AvatarModel.tableName}.user_id`,
				to: `${this.tableName}.id`
			}
		},
		posts: {
			relation: Model.HasManyRelation,
			modelClass: PostModel,
			join: {
				from: `${PostModel.tableName}.user_id`,
				to: `${this.tableName}.id`
			}
		},
		blogs: {
			relation: Model.ManyToManyRelation,
			modelClass: BlogModel,
			join: {
				from: `${this.tableName}.id`,
				through: {
					from: 'blogs_users.user_id',
					to: 'blogs_users.blog_id',
				},
				to: `${BlogModel.tableName}.id`
			}
		},
		followers: {
			relation: Model.ManyToManyRelation,
			modelClass: this,
			join: {
				from: `${this.tableName}.id`,
				through: {
					from: 'blogs_users.to_user_id',
					to: 'blogs_users.from_user_id',
				},
				to: `${this.tableName}.id`
			}
		},
		following: {
			relation: Model.ManyToManyRelation,
			modelClass: this,
			join: {
				from: `${this.tableName}.id`,
				through: {
					from: 'blogs_users.from_user_id',
					to: 'blogs_users.to_user_id',
				},
				to: `${this.tableName}.id`
			}
		}
	}
}
```

### buildRelations
These same relationships can be defined in just a few lines of code using `buildRelations`:
```js
export class UserModel extends Model {
	static buildRelations() {
		return {
			avatar: this.hasOne(AvatarModel),
			posts: this.hasMany(PostModel),
			blogs: this.belongsToMany(BlogModel),
			followers: this.belongsToMany(this, 'followers', 'to_user_id', 'from_user_id'),
			following: this.belongsToMany(this, 'followers', 'from_user_id', 'to_user_id'),
		}
	}
}
```

## Cyclical Dependencies
Another huge advantage of using `buildRelations` over `relationMappings` is that since it’s a function and not a class property, there’s no concerns with cyclical dependencies.

Take for instance, the following scenario:

* `UserModel` has a relationship to `PostModel` to establish a users posts
* `PostModel` has a relationship to `UserModel` to establish the author of the post

If you setup `relationMappings` as a class property, Node is forced to resolve both simultaneously, leading to one being temporarily null and breaking your code (which is null is undefined, depending on the entry path to these models).

By shifting this into a function that is called the first time `relationMappings` is used, Grind’s Model is able to ensure both imports are fully resolved.

## Eager Loading
Objection.js has an amazing way to do [eager loading](http://vincit.github.io/objection.js/#eager-queries), however in order to use it, you have to declare it every place you query the model.

Grind Model has a way to let you define eager loading on a Model level that will ensure whenever your model is used, it will eager load those relationships.
```js
export class BlogModel {
	static eager = "[owner,posts(latest)]"
	static eagerFilters = {
		latest: builder => builder.orderBy('created_at').limit(1)
	}
}
```

### eager
The `eager` class property lets you define the [relation expression](http://vincit.github.io/objection.js/#relationexpression) to load every time the model is queried.

### eagerFilter
You an also define [filters](http://vincit.github.io/objection.js/#eager) for `eager` by setting them on the (optional) `eagerFilter` class property.

## Global Eager Filters
Grind Model let’s you define global filters to use in any eager expression by calling `QueryBuilder.registerFilter()`.

The recommended way to load filters is via a [providers](docs:providers):
```js
import { Model } from 'grind-orm'

export function EagerFiltersProvider() {
	Model.QueryBuilder.registerFilter('active', builder => builder.where('active', 1))
}
```

Now you can just use the `active` filter in any eager expression without having to declare it each time.
