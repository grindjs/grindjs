# Configuration

Grind provides JSON-based config using cascading directories based on your current environment.

> {tip} **JSON5 Ready**
> Grind uses [JSON5](http://json5.org) to parse it’s config files, so go ahead and use single quotes, multiline strings, comments, and everything else JSON5 offers.

[[toc]]

## Base Usage

Grind will look for the `config` directory at the root level of your project.

Your [directory structure](directory-structure) should look like this:

```
┌─ app
├─ config
│  ├── app.json
│  └── database.json
├─ public
└─ resources
```

Each JSON file represents a different group of config. When querying a value in `app.json` You’ll make a call such as:

```js
app.config.get('app.port')
```

If you wanted to access a value in `database.json`:

```js
app.config.get('database.default')
```

You can also pass in a fallback value if the config setting doesn’t exist:

```js
app.config.get('database.default', 'mysql')
```

### Example: Config based API settings

```json
{
  "host": "localhost:3000",
  "key": "dev-key",
  "http": {
    "timeout": 1000,
    "gzip": true
  }
}
```

You can now access these settings via `app.config`:

```js
Log.comment('API Host', app.config.get('app.host'))
Log.comment('API Timeout', app.config.get('app.http.timeout'))
```

## Cascading Environment Config

Config uses directories for each environment, cascading downwards. When loading files from a `production` directory, config will cascade down to the root so you don’t need to redefine every single setting, you can just override the settings you need.

Your directory structure with an environment directory will look like this:

```
┌─ app
├─ config
│  ├── production
│  │  └── database.json
│  ├── app.json
│  └── database.json
├─ public
└─ resources
```

### Example: Config based API settings, Redux

While running the API on localhost is fine during development, in production it’s probably going to exist on it’s own cluster with a different host.

This is simple enough to do with config:

**config/app.json**

```json
{
  "host": "localhost:3000",
  "key": "dev-key"
}
```

**config/production/app.json**

```json
{
  "host": "prod.api-cluster",
  "key": "super-secret-prod-key"
}
```

Using the same code from the previous example:

```js
Log.comment('API Host', app.config.get('app.host'))
```

Your app will still use `localhost:3000` locally, but now when you run it in production, it’ll start using `prod.api-cluster`.

Since config cascades, you can still query for the `host.timeout` config value without having to redefine it in `config/production/api.json`:

```js
// This will output the same value both locally and in production
Log.comment('API Timeout', app.config.get('app.http.timeout'))
```

## Sensitive information & .env.json

If you were paying attention above, you may have seen something you should never do:

```json
{
  "host": "prod.api-cluster",
  "key": "super-secret-prod-key" // <-- This is bad!
}
```

Storing private API keys in version control is a security faux pas, so Grind has a better way.

Config supports a special type of config file, `.env.json`. This is where sensitive information such as database passwords and API keys should go. The `.env.json` file should never be committed to version control; instead you should have a `.env.json` file locally for your personal development environment, and then during your deploy process inject a version of `.env.json` with values matching your production environment.

Unlike other config files `.env.json` is processed differently to allow you to define top level groups within it. Where other config files have a one to one relationship with their file to a config group, `.env.json` contains multiple groups. If you have `"app": { "key": "value"}` in your `.env.json` file, you’re overriding `key` in the `app.json` file and not creating a new `env` config group.

### Example: Config based API settings, safely

Assuming the following directory structure:

```
config
├── encryption.json
└── api.json
```

While it’s perfectly safe to store non-sensitive config values in `encryption.json` and `api.json`, when it comes to credentials and passwords, you probably don’t want those living in version control.

**config/encryption.json**

```json
{
  "key": null,
  "cipher": "AES-256-CBC"
}
```

**config/api.json**

```json
{
  "host": "localhost:3000",
  "key": null,
  "http": {
    "timeout": 1000,
    "gzip": true
  }
}
```

With a basic schema now defined for these groups, you can create `config/.env.json` and fill out the sensitive values:

```json
{
  "encryption": {
    "key": "my-super-seret-encryption-key"
  },
  "api": {
    "key": "my-secret-api-key"
  }
}
```

These values will now override the `null` values originally defined when being queried in your app.
