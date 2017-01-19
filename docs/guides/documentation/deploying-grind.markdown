# Creating a Project
## Using Grind Installer
Once you have the Grind Installer [installed](doc:getting-started#installing-grinds-installer), it's easy to setup a new project.  Just run the following command:
```shell
grind new project-name
```

> **tl;dr API Projects**
> When running the previous command, it defaults to setting up a web project.  If you’re going to be building an API, you should run `grind new project-name --type=api` to avoid installing unwanted dependencies that may slow your project down.

### CLI options
The `grind` command provides a couple of different options for you when setting up a new project.  You can run `grind new --help` for full details, here’s a quick list of options:

* `--type=[web|api]`
	* `web` is the default option, so there’s no need to pass it explicitly.  A web project includes a fully functional example site built on Grind, and includes dependencies for asset compilation and optimization, template rendering and HTML helpers.
	* `api` should be used if you’re building, well, an API.  The API project will be barebones with enough to get you started, but not too much that it starts slowing you down.
* `--skip-npm`
 * By default `grind new` will run `npm install` for you, if you’d prefer to run it yourself and save time during project creation, you can pass this option.
* `--tag=??`
 * Without this flag, the installer will grab a list of available tags and pick the newest one.  If you’d prefer to install an older version of Grind (or a future, unreleased, version), you can explicitly pass in a tag via `--tag=0.4.0`.  Passing in the name of a branch or a commit hash as a tag is also supported.

## Without Grind Installer
If you’re prefer not to install Grind’s installer, you can quickly clone one of Grind’s example repositories to get started:

* [https://github.com/grindjs/example-web](https://github.com/grindjs/example-web)
* [https://github.com/grindjs/example-api](https://github.com/grindjs/example-api)

```shell
git clone --depth 1 https://github.com/grindjs/example-web.git project-name
cd project-name
rm -fr .git && git init # Clear out the existing example git history and start fresh
```
