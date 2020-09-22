# Database

Grind’s [Database provider](https://github.com/grindjs/db) integrates Grind with [knex.js](http://knexjs.org).

[[toc]]

## Installation

First, add the `grind-db` package via your preferred package manager:

```shell
yarn add grind-db
```

Next, you’ll need to add `DatabaseProvider` to your app providers in `app/Boostrap.js`:

```js
import Grind from 'grind-framework'
import { DatabaseProvider } from 'grind-db'

const app = new Grind()
app.providers.push(DatabaseProvider)
```

### Dependencies

In order to actually use a database, you’ll first need to install the database driver(s) you need. Knex [supports](http://knexjs.org/#Installation-node) a variety of different drivers:

```shell
yarn add mysql2
yarn add mariasql
yarn add sqlite3
yarn add pg
```

## Usage

The default database connection is exposed via `app.db`. For full details on how the query builder works, head over to the [knex.js documentation](http://knexjs.org).

```js
app
  .db('users')
  .where('name', 'like', 'grind%')
  .then(users => {
    Log.comment('Retrieved users', users)
  })
```

## Configuration

Your database config should live in `/config/database.json`.

Here’s an example of a config file that supports both MariaDB and SQLite:

```json
{
  "default": "sqlite3",
  "connections": {
    "maria": {
      "driver": "mariasql",
      "host": "localhost",
      "db": "app-db-name",
      "user": "app-user",
      "password": "app-password",
      "charset": "utf8"
    },
    "sqlite3": {
      "driver": "sqlite3",
      "filename": "./database/database.sqlite",
      "useNullAsDefault": true
    }
  }
}
```

The `default` key tells the Database provider which connection it should load by default.
