# grind-db

`grind-db` is a thin wrapper around [knex.js](http://knexjs.org/) for simple integration with [Grind](https://github.com/shnhrrsn/grind-framework).

## Installation

Add `grind-db` to your project:

```bash
npm install grind-db --save
```

Next you should the database driver(s) you need.  Knex [supports](http://knexjs.org/#Installation-node) a variety of different drivers:

```bash
npm install mariasql --save
npm install mysql2 --save
npm install sqlite3 --save
npm install pg --save
```

## Usage

To use `grind-db` you’ll need to add it to your `Grind` providers:

```js
import Grind from 'grind-framework'
import {DatabaseProvider} from 'grind-db'

const app = new Grind()
app.providers.push(DatabaseProvider)
```

From there, you can access the connection via `app.get('db')`.

## Config

`grind-db` creates it’s Knex instance by leveraging `Grind`’s config system.  See [config.sample.json](config.sample.json) for full details, but here’s a quick example using Maria:

```json
{
	"default": "maria",
	"connections": {
		"maria": {
			"driver": "mariasql",
			"host": "localhost",
			"db": "db-name",
			"user": "some-user",
			"password": "super-secret-password",
			"charset": "utf8"
		}
	}
}
```

You should place this in `config/database.json` in your Grind project.

## CLI

`grind-db` uses `grind-cli` for it’s CLI commands.  Run `bin/cli` in your project for a list of commands.
