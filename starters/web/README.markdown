<p align="center"><a href="https://grind.rocks"><img src="https://s3.amazonaws.com/assets.grind.rocks/docs/img/grind-template-web.svg" alt="Grind Template Web" /></a></p>

<p align="center">
<a href="https://cloud.drone.io/grindjs/example-web"><img src="https://cloud.drone.io/api/badges/grindjs/example-web/status.svg" alt="Build Status"></a>
<a href="https://github.com/grindjs/example-web"><img src="https://img.shields.io/github/tag/grindjs/example-web.svg" alt="Latest Version"></a>
<a href="https:/grind.chat"><img src="https://grind.chat/badge.svg" alt="Slack"></a>
<a href="https://github.com/grindjs/example-web"><img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License"></a>
</p>

# Grind Web Template

The Grind Web Template is an example project for building websites on [Grind](https://github.com/grindjs/framework).  It’s also used as the default template in [Grind Installer](https://github.com/grindjs/installer) so you can quickly setup a new web project.

## Installation

```bash
git clone https://github.com/grindjs/example-web.git grind-example-web
cd grind-example-web
npm install
```

## Running

```bash
# Use `watch` to automatically restart the server on file changes
# Watch is recommended for development
bin/cli watch

# Use `serve --cluster` to launch a cluster of workers
# Cluster is recommended for production
bin/cli serve --cluster

# Use `serve` to launch a single worker
bin/cli serve
```

You should now be able to visit [localhost:3100](http://localhost:3100).

## Documentation

Full documentation for Grind is available on the [Grind website](https://grind.rocks/).

## License

Grind was created by [Shaun Harrison](https://github.com/shnhrrsn) and is made available under the [MIT license](LICENSE).
