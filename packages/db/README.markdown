# grind-db

`grind-db` is a thin wrapper around [knex.js](http://knexjs.org/) simple integration with [Grind](https://github.com/shnhrrsn/grind).

## Installation

Add `grind-db` to your project:

```bash
npm install shnhrrsn/grind-db --save
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

```coffee-script
Grind = require 'grind'

app = new Grind
app.providers.push require('grind-db').provider
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
