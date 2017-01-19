---
title: "CLI"
excerpt: ""
---
Grind’s [CLI provider](https://github.com/grindjs/cli) is built on [Commander](https://www.npmjs.com/package/commander), however Grind’s implementation differs greatly.

Grind provides it’s own `Command` base class and registration mechanism that shares very little in common with Commander.  Internally, Grind Commands are built on and compile into Commander, however the underlying API is not exposed.
[block:api-header]
{
  "type": "basic",
  "title": "Usage"
}
[/block]
### Running the CLI

The Grind CLI is triggered via `bin/cli`.  Running `bin/cli --help` will show you a list of available commands to run.

### Getting Help

All commands support passing a `--help` command to tell you more about the command, including options and arguments available.
[block:code]
{
  "codes": [
    {
      "code": "$ bin/cli make:model --help\n\n  Usage: make:model [options],<className?>\n\n  Create a model class\n\n  Options:\n\n    -h, --help            output usage information\n    -t, --table [string]  Name of the table to create the model for",
      "language": "shell"
    }
  ]
}
[/block]

[block:api-header]
{
  "type": "basic",
  "title": "Creating Commands"
}
[/block]
## Command Generator

The fastest way to create a new command is by using the command generator via `bin/cli make:command`.

You can invoke `make:command` with a few different arguments:

* `bin/cli make:command MakeThingCommand` will create `app/Commands/MakeThingCommand.js`, but will not infer a command name.
* `bin/cli make:command --comandName=make:thing` will also create `app/Commands/MakeThingCommand.js` and will set the command name for you.
* You can also pass both a class name and a command name at the same time — though this isn’t advised.

## Naming Conventions

All command names should be formatted as `namespace:name`, in the above example `make` is the namespace and `thing` is the name.

Class names should follow the command name with a Command suffix, so `make:thing` becomes `MakeThingCommand`.

## Command Class

Once you’ve triggered `make:command`, a class is generated for you that looks like this:
[block:code]
{
  "codes": [
    {
      "code": "import {Command} from 'grind-cli'\n\nexport class MakeThingCommand extends Command {\n\t// Name of the command\n\tname = 'make:thing'\n\n\t// Description of the command to show in help\n\tdescription = 'Command description'\n\n\t// Arguments available for this command\n\targuments = [ 'requiredArgument', 'optionalArgument?' ]\n\n\t// Options for this command\n\toptions = {\n\t\t'some-option': 'Description of this option'\n\t}\n\n\trun() {\n\t\t// Build something great!\n\t}\n\n}",
      "language": "javascript"
    }
  ]
}
[/block]
### name

The name of the command is what you invoke via `bin/cli`, so for MakeThingCommand we would invoke it by calling `bin/cli make:thing`

### description

The description is what shows up in `bin/cli --help` for your command.  You should provide a short, concise description of what your command does.

### arguments

Arguments are data passed into your command, in the order they’re declared.  You can have an optional argument by ending the name with a question mark: `optionalArgument?`.

* `bin/cli make:thing name` would give `requiredArgument` a value of `name` and `optionalArgument` would be `null`.
* `bin/cli make:thing name otherName` would still give `requiredArgument` a value of `name`, however `optionaArgument` would now have a value of `otherName`

### options

Options are flags passed to your command via two leading dashes, if options expect a value, the value is passed by using an equals sign:

* `bin/cli make:thing --some-option` gives `some-option` a value of `true`
* `bin/cli make:thing --some-option=grind` gives `some-option` a value of `grind`

Options can be passed in before or after arguments and will not affect the order in which arguments are processed in.

Options are declared by setting `options` to an object with the key being the name of the option, and the value it’s description:
[block:code]
{
  "codes": [
    {
      "code": "options = {\n\t'some-option': 'Description of this option'\n}",
      "language": "javascript"
    }
  ]
}
[/block]
You can also require a value for your option (instead of accepting a boolean flag) by passing the value an array with the first element being the description, and the second being the type of value (currently only string is accepted):
[block:code]
{
  "codes": [
    {
      "code": "options = {\n\t'some-option': [ 'Description of this option', 'string' ]\n}",
      "language": "javascript"
    }
  ]
}
[/block]
### run

The `run` function is what is called when your command is invoked.  CLI supports `run` returning a promise for asynchronous support.

### ready

You can also add a `ready` function to your command to perform startup tasks to be run when your command is invoked, but before `run` is called.  CLI supports `ready` returning a promise for asynchronous support.

For instance, you may want to `ready` to load data to be used during the execution of the command:
[block:code]
{
  "codes": [
    {
      "code": "import fs from 'fs-promise'\n\nexport class MakeThingCommand extends Command {\n\n\tready() {\n\t\treturn fs.readFile(this.app.paths.base('countries.json'))\n\t\t.then(data => {\n\t\t\tthis.countries = JSON.parse(data)\n\t\t})\n\t}\n\n}",
      "language": "javascript"
    }
  ]
}
[/block]
Now when `run` is called, it will already have `this.countries` populated.

## Retrieving Argument/Option Values

You can retrieve arguments and options via the `argument` and `option` functions.

### argument
[block:code]
{
  "codes": [
    {
      "code": "const value = this.argument(name, fallback)",
      "language": "javascript"
    }
  ]
}
[/block]
* `name` — The name of the argument to get the value of
* `fallback` — Optional parameter to provide a default value for optional arguments.  Passing a value here for a required argument will have no effect, since the your command won’t execute unless all required arguments are satisfied.

### option
[block:code]
{
  "codes": [
    {
      "code": "const value = this.option(name, fallback)",
      "language": "javascript"
    }
  ]
}
[/block]
* `name` — The name of the option to get the value of
* `fallback` — Optional parameter to provide a default value for an option not provided

## Prompting for Input

You prompt the user for input via the `ask` and `confirm` functions.

### ask
[block:code]
{
  "codes": [
    {
      "code": "this.ask('What is your name?').then(answer => this.comment(`Hello ${answer}`))",
      "language": "javascript"
    }
  ]
}
[/block]
The `ask` function takes a single `question` parameter, which is then outputted to the user, and returns a promise.  The promise will resolve with the user’s answer to the question.

### confirm
[block:code]
{
  "codes": [
    {
      "code": "this.confirm('Are you sure you want to proceed?', false).then(answer => /* … */)",
      "language": "javascript"
    }
  ]
}
[/block]
The `confirm` function is a helpful wrapper around `ask` for asking binary questions.  The first parameter is `question`, which is outputted to the user.  The second parameter is `defaultAnswer`, the `defaultAnswer` answer is used when the user provides no response and just hits enter.

`confirm` will accept accept the following user answers as `true` (case-insensitive):

* true
* t
* 1
* yes
* y

All other input from the user will be evaluated as `false`.

## Writing Output

The Command class has the following methods available for writing output to the terminal:
[block:code]
{
  "codes": [
    {
      "code": "info(...message) // Outputs default text color\ncomment(...message) // Outputs as blue text\nwarn(...message) // Outputs as yellow text\nerror(...message) // Outputs as white text with a red background\nsuccess(...message) // Output as green text",
      "language": "javascript"
    }
  ]
}
[/block]
These methods simply call the same method on `app.cli.output`, which itself redirects to the global `Log` class.  For more information logging and providing your own logger, see the [Logging documentation](doc:logging).
[block:api-header]
{
  "type": "basic",
  "title": "Default Commands"
}
[/block]
Grind’s providers ship with a bunch of default commands to help make development easier.

### Assets
Assets includes the `assets:publish` and `assets:unpublish` commands to help precompile your assets during deployment.  See the [Assets documentation](doc:assets#deployments) for more information.

### CLI
As noted above, the CLI includes a built in `make:command` command to generate commands for you.

### Database
The database provider includes a number of commands for migrating and seeding the database:

* `make:migration` – Creates a migration file
* `make:seed` – Creates a database seed file
* `migrate:current-version` – Displays the current migration version
* `migrate:latest` — Runs all outstanding migrations
* `migrate:rollback` — Reverts the last set of migrations performed
* `db:seed` — Runs all seed files to populate your database

See the [Migrations & Seeds documentation](doc:migrations-seeds) for more information.

### ORM
ORM has a single `make:model` command that generates model classes for you. See the [ORM documentation](doc:orm) for more information.