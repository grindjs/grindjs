<p align="center"><a href="https://grind.rocks"><img src="https://assets.grind.rocks/docs/img/grind-template-api.svg" alt="Grind Template API" /></a></p>

<p align="center">
<a href=".https://github.com/grindjs/grindjs/tree/master/starters/api"><img src="https://img.shields.io/github/tag/grindjs/example-api.svg" alt="Latest Version"></a>
<a href="https://chat.grind.rocks"><img src="https://chat.grind.rocks/badge.svg" alt="Slack"></a>
<a href="https://github.com/grindjs/grindjs/tree/master/starters/api"><img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License"></a>
</p>

# Grind API Template

The Grind API Template is an example project for building API’s on [Grind](https://github.com/grindjs/grindjs). It’s also used as a template in [Grind Toolkit](https://github.com/grindjs/grindjs/tree/master/packages/toolkit) so you can quickly setup a new API project.

## Installation

```bash
git clone https://github.com/grindjs/example-api.git grind-example-api
cd grind-example-api
yarn install
yarn cli migrate:latest
yarn cli db:seed
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

You should now be able to visit [localhost:3000/states](http://localhost:3000/states).

Other URLs:

- Paged: [localhost:3000/states?limit=10](http://localhost:3000/states?limit=10)
- Individual: [localhost:3000/states/ny](http://localhost:3000/states/ny)
- Search: [localhost:3000/states/search?term=new](http://localhost:3000/states/search?term=new)
- Swagger: [petstore.swagger.io/?url=http://localhost:3000/swagger.json](http://petstore.swagger.io/?url=http://localhost:3000/swagger.json)

## Documentation

Full documentation for Grind is available on the [Grind website](https://grind.rocks/).

## License

Grind was created by [Shaun Harrison](https://github.com/shnhrrsn) and is made available under the [MIT license](LICENSE).
