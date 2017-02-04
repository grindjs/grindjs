<p align="center"><a href="https://grind.rocks"><img src="https://s3.amazonaws.com/assets.grind.rocks/docs/img/grind-installer.svg" alt="Grind Installer" /></a></p>

<p align="center">
<a href="https://travis-ci.org/grindjs/installer"><img src="https://img.shields.io/travis/grindjs/installer.svg" alt="Build Status"></a>
<a href="https://www.npmjs.com/package/grind-installer"><img src="https://img.shields.io/npm/dt/grind-installer.svg" alt="Total Downloads"></a>
<a href="https://www.npmjs.com/package/grind-installer"><img src="https://img.shields.io/npm/v/grind-installer.svg" alt="Latest Version"></a>
<a href="https:/grind.chat"><img src="https://grind.chat/badge.svg" alt="Slack"></a>
<a href="https://www.npmjs.com/package/grind-installer"><img src="https://img.shields.io/npm/l/grind-installer.svg" alt="License"></a>
</p>

# Grind Installer

Grind Installer is a CLI tool you can use in your dev environment to quickly create new [Grind](https://github.com/grindjs/framework) projects.

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

## License

Grind was created by [Shaun Harrison](https://github.com/shnhrrsn) and is made available under the [MIT license](LICENSE).
