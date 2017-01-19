---
title: "Database"
excerpt: ""
---
Grind’s [Database provider](https://github.com/grindjs/db) integrates Grind with [knex.js](http://knexjs.org).
[block:api-header]
{
  "type": "basic",
  "title": "Installation"
}
[/block]
In order to actually use a database, you’ll first need to install the database driver(s) you need.  Knex [supports](http://knexjs.org/#Installation-node) a variety of different drivers:
[block:code]
{
  "codes": [
    {
      "code": "npm install mariasql --save\nnpm install mysql2 --save\nnpm install sqlite3 --save\nnpm install pg --save",
      "language": "shell"
    }
  ]
}
[/block]

[block:api-header]
{
  "type": "basic",
  "title": "Usage"
}
[/block]
The default database connection is exposed via `app.db`.  For full details on how the query builder works, head over to the [knex.js documentation](http://knexjs.org).
[block:code]
{
  "codes": [
    {
      "code": "app.db('users').where('name', 'like', 'grind%').then(users => {\n  Log.comment('Retrieved users', users)\n})",
      "language": "javascript"
    }
  ]
}
[/block]

[block:api-header]
{
  "type": "basic",
  "title": "Configuration"
}
[/block]
Your database config should live in `/config/database.json`.

Here’s an example of a config file that supports both MariaDB and SQLite:
[block:code]
{
  "codes": [
    {
      "code": "{\n\n\t\"default\": \"sqlite3\",\n\n\t\"connections\": {\n\n\t\t\"maria\": {\n\t\t\t\"driver\": \"mariasql\",\n\t\t\t\"host\": \"localhost\",\n\t\t\t\"db\": \"app-db-name\",\n\t\t\t\"user\": \"app-user\",\n\t\t\t\"password\": \"app-password\",\n\t\t\t\"charset\": \"utf8\"\n\t\t},\n\n\t\t\"sqlite3\": {\n\t\t\t\"driver\": \"sqlite3\",\n\t\t\t\"filename\": \"./database/database.sqlite\",\n\t\t\t\"useNullAsDefault\": true\n\t\t}\n\n\t}\n\n}\n",
      "language": "json"
    }
  ]
}
[/block]
The `default` key tells the Database provider which connection it should load by default.