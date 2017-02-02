# grind-installer

This is the cli installer for Grind.

## Installation

### npm

```bash
npm install -g grind-installer
```

### yarn
```bash
yarn install -g grind-installer
```

## Usage

```bash
Usage:
  grind new [options] <name?>

Arguments:
  name                     The name of the project to create

Options:
  --template[=TEMPLATE]    API or Web. [default: ‘web’]
  --tag[=TAG]              Repository tag to use, defaults to most recent tag.
  --skip-packages          If present, packages will not be installed.
  --prefer-npm             yarn will be used by default if it’s installed.  Pass this to use npm.
```
