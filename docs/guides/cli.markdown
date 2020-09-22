# CLI

[[toc]]

## Usage

### Running the CLI

The Grind CLI is triggered via `yarn cli`. Running `yarn cli --help` will show you a list of available commands to run.

### Getting Help

All commands support passing a `--help` command to tell you more about the command, including options and arguments available.

```shell
$ yarn cli make:model --help
Usage:
  make:model [options] <name?>

Arguments:
  name               The name of the model.

Options:
  --table[=TABLE]    Name of the table to create the model for
  --help             Display this help message
  --no-ansi          Disable ANSI output

Help:
  Create a model class
```

## Creating Commands

### Command Generator

The fastest way to create a new command is by using the command generator via `yarn cli make:command`.

You can invoke `make:command` with a few different arguments:

- `yarn cli make:command MakeThingCommand` will create `app/Commands/MakeThingCommand.js`, but will not infer a command name.
- `yarn cli make:command --command=make:thing` will also create `app/Commands/MakeThingCommand.js` and will set the command name for you.
- You can also pass both a class name and a command name at the same time — though this isn’t advised.

### Naming Conventions

All command names should be formatted as `namespace:name`, in the above example `make` is the namespace and `thing` is the name.

Class names should follow the command name with a Command suffix, so `make:thing` becomes `MakeThingCommand`.

### Command Class

Once you’ve triggered `make:command`, a class is generated for you that looks like this:

```js
import { Command, InputArgument, InputOption } from 'grind-cli'

export class MakeThingCommand extends Command {
  // Name of the command
  name = 'make:thing'

  // Description of the command to show in help
  description = 'Command description'

  // Arguments available for this command
  arguments = [
    new InputArgument('requiredArg', InputArgument.VALUE_REQUIRED, 'This argument is required'),
    new InputArgument(
      'optionalArg',
      InputArgument.VALUE_OPTIONAL,
      'This argument is optional',
      'Default value',
    ),
  ]

  // Options for this command
  options = [
    new InputOption(
      'someOption',
      InputOption.VALUE_OPTIONAL,
      'This is an optional option',
      'Default Value',
    ),
    new InputOption('quiet', InputOption.VALUE_NONE, 'This is a flag option'),
  ]

  run() {
    // Build something great!
  }
}
```

#### name

The name of the command is what you invoke via `yarn cli`, so for MakeThingCommand we would invoke it by calling `yarn cli make:thing`

#### description

The description is what shows up in `yarn cli --help` for your command. You should provide a short, concise description of what your command does.

#### arguments

Arguments are data passed into your command, in the order they’re declared.

#### options

Options are flags passed to your command via two leading dashes, if options expect a value, the value is passed by using an equals sign:

- `yarn cli make:thing --some-option` gives `some-option` a value of `true`
- `yarn cli make:thing --some-option=grind` gives `some-option` a value of `grind`

Options can be passed in before or after arguments and will not affect the order in which arguments are processed in.

#### run

The `run` function is what is called when your command is invoked. CLI supports `run` returning a promise for asynchronous support.

#### ready

You can also add a `ready` function to your command to perform startup tasks to be run when your command is invoked, but before `run` is called. CLI supports `ready` returning a promise for asynchronous support.

For instance, you may want to `ready` to load data to be used during the execution of the command:

```js
import { FS } from 'grind-support'

export class MakeThingCommand extends Command {
  ready() {
    return FS.readFile(this.app.paths.base('countries.json')).then(data => {
      this.countries = JSON.parse(data)
    })
  }
}
```

Now when `run` is called, it will already have `this.countries` populated.

## Retrieving Argument/Option Values

You can retrieve arguments and options via the `argument` and `option` functions.

#### argument

```js
const value = this.argument(name, fallback)
```

- `name` — The name of the argument to get the value of
- `fallback` — Optional parameter to provide a default value for optional arguments. Passing a value here for a required argument will have no effect, since the your command won’t execute unless all required arguments are satisfied.

#### option

```js
const value = this.option(name, fallback)
```

- `name` — The name of the option to get the value of
- `fallback` — Optional parameter to provide a default value for an option not provided

## Prompting for Input

You prompt the user for input via the `ask` and `confirm` functions.

#### ask

```js
this.ask('What is your name?').then(answer => this.comment(`Hello ${answer}`))
```

The `ask` function takes a single `question` parameter, which is then outputted to the user, and returns a promise. The promise will resolve with the user’s answer to the question.

#### confirm

```js
this.confirm('Are you sure you want to proceed?', false).then(answer => /* … */)
```

The `confirm` function is a helpful wrapper around `ask` for asking binary questions. The first parameter is `question`, which is outputted to the user. The second parameter is `defaultAnswer`, the `defaultAnswer` answer is used when the user provides no response and just hits enter.

`confirm` will accept accept the following user answers as `true` (case-insensitive):

- true
- t
- 1
- yes
- y

All other input from the user will be evaluated as `false`.

## Writing Output

The Command class has the following methods available for writing output to the terminal:

```js
info(...message) // Outputs default text color
comment(...message) // Outputs as blue text
warn(...message) // Outputs as yellow text
error(...message) // Outputs as white text with a red background
success(...message) // Output as green text
```

These methods simply call the same method on `app.cli.output`, which itself redirects to the global `Log` class. For more information logging and providing your own logger, see the [Logging documentation](logging).

## Default Commands

Grind’s providers ship with a bunch of default commands to help make development easier.

### Assets

Assets includes the `assets:publish` and `assets:unpublish` commands to help precompile your assets during deployment. See the [Assets documentation](assets#deployments) for more information.

### CLI

As noted above, the CLI includes a built in `make:command` command to generate commands for you.

### Controllers

You can generate controllers via `make:controller`. You can also pass a `--resource` flag to generate a full resource controller.

### Database

The database provider includes a number of commands for migrating and seeding the database:

- `make:migration` – Creates a migration file
- `make:seed` – Creates a database seed file
- `migrate:current-version` – Displays the current migration version
- `migrate:latest` — Runs all outstanding migrations
- `migrate:rollback` — Reverts the last set of migrations performed
- `db:seed` — Runs all seed files to populate your database

See the [Migrations & Seeds documentation](migrations-seeds) for more information.

### ORM

ORM has a single `make:model` command that generates model classes for you. See the [ORM documentation](orm) for more information.
