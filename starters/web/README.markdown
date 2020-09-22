<p align="center"><a href="https://grind.rocks"><img src="https://assets.grind.rocks/docs/img/grind-template-web.svg" alt="Grind Template Web" /></a></p>

<p align="center">
<a href="https://github.com/grindjs/grindjs/tree/master/starters/web"><img src="https://img.shields.io/github/tag/grindjs/example-web.svg" alt="Latest Version"></a>
<a href="https://chat.grind.rocks"><img src="https://chat.grind.rocks/badge.svg" alt="Slack"></a>
<a href="https://github.com/grindjs/grindjs/tree/master/starters/web"><img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License"></a>
</p>

# Grind Web Template

The Grind Web Template is an example project for building multipage websites on [Grind](https://github.com/grindjs/grindjs). It’s also used as the default template in [Grind Toolkit](https://github.com/grindjs/grindjs/tree/master/packages/toolkit) so you can quickly setup a new web project.

## Installation

```bash
git clone https://github.com/grindjs/example-web.git grind-example-web
cd grind-example-web
yarn install
```

## Running

```bash
# Use `watch` to automatically restart the server on file changes
# Watch is recommended for development
yarn cli watch

# Use `serve --cluster` to launch a cluster of workers
# Cluster is recommended for production
yarn cli serve --cluster

# Use `serve` to launch a single worker
yarn cli serve
```

You should now be able to visit [localhost:3100](http://localhost:3100).

## Documentation

Full documentation for Grind is available on the [Grind website](https://grind.rocks/).

## License

Grind was created by [Shaun Harrison](https://github.com/shnhrrsn) and is made available under the [MIT license](LICENSE).
