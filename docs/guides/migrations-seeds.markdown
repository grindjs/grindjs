# Migrations & Seeds
Grind’s Database is built on Knex.js, so for full documentation on schema building check out the [Knex documentation](http://knexjs.org/#Schema).

This document assumes you have a basic understanding of how migrations & seeds work in Knex and focuses on their integration into Grind.
## Running Migrations
Grind’s [Database](doc:database) integrates Knex tightly into Grind, so all CLI management of your database will be through [Grind’s CLI](doc:cli) and not through the `knex` command.  This allows us to leverage all existing Grind config and models, without having to worry about building a separate Knexfile.

## CLI Commands

Grind offers three different CLI commands for managing migrations:

### migrate:latest
```shell
bin/cli migrate:latest
```
The `migrate:latest` command will run all outstanding migrations on your database.  If you run this against a new database, it will first setup the database and then run the migrations.

### migrate:rollback
```shell
bin/cli migrate:rollback
```
The `migrate:rollback` command will revert the last batch of migrations by going through each migration in reverse order and calling the `down` function.

### migrate:current-version
```shell
bin/cli migrate:current-version
```
The `migrate:current-version` command will output the current version of your migrations.
## Seeding the Database
Like migrations, you seed the database through `bin/cli` and not through the `knex` command.

To seed the database, there's a single `db:seed` command.
```shell
bin/cli db:seed
```
Running `db:seed` will run through and execute each seed file.
> **Use Caution!**
> Unlike migrations, seeds don’t have a concept of state.  Every time you run `db:seed`, it runs all seeds, not just new seeds you’ve added.  This means that existing data will likely be cleared out by your seeds each time they’re ran.

## Generators
## Migration Generator
You can generate a migration via `bin/cli make:migration`.  There are a few different options for you to invoke `make:migration` with:

* `bin/cli make:migration create_users_table` will create `/database/migrations/###-create_users_table.js` as a basic migration
* `bin/cli make:migration --create=users` will also create `/database/migrations/###-create_users_table.js`, however it generates boilerplate code to create the `users` table.
* `bin/cli make:migration --alter=users` will create `/database/migrations/###-alter_users_table.js`, and it will generate boilerplate code to alter the `users` table.
* `bin/cli make:migration --alter=users alter_users_add_disabled` will create `/database/migrations/###-alter_users_add_disabled.js`, and it will generate boilerplate code to alter the `users` table.

## Seed Generator
You can generate a seed file via `bin/cli make:seed`.  You can invoke `make:seed` with a couple of different arguments:

* `bin/cli make:seed users` will create `database/seeds/##-users.js`, but will not infer a table name.
* `bin/cli make:seed --table=users` will also create `database/seeds/##-users.js`, but it will also set the table name for you.
