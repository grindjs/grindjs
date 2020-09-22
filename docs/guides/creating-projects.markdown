# Creating a Project

[[toc]]

## Using Grind Installer

Once you have the Grind Installer [installed](installation#installing-grinds-installer), it's easy to setup a new project. Just run the following command:

```shell
grind new project-name
```

### CLI options

The `grind` command provides a couple of different options for you when setting up a new project. You can run `grind new --help` for full details, here’s a quick list of options:

- `--template=[web|react|api]`
  _ `web` is the default option, so there’s no need to pass it explicitly. A web project includes a fully functional example site built on Grind, and includes dependencies for asset compilation and optimization, template rendering and HTML helpers.
  _ `react` is similar to the web template but for React! A React project includes a fully functional example site built on Grind and React, and includes dependencies for asset compilation and optimization. \* `api` should be used if you’re building, well, an API. The API project will be barebones with enough to get you started, but not too much that it starts slowing you down.
- `--skip-packages` \* By default `grind new` will run `yarn install` or `npm install` for you, if you’d prefer to run it yourself and save time during project creation, you can pass this option.
- `--prefer-npm` \* Yarn is used by default if it’s detected, you can use `--prefer-npm` to override that behavior and install using `npm`.
- `--tag=??` \* Without this flag, the installer will grab a list of available tags and pick the newest one. If you’d prefer to install an older version of Grind (or a future, unreleased, version), you can explicitly pass in a tag via `--tag=0.6.0`. Passing in the name of a branch or a commit hash as a tag is also supported.

## Without Grind Installer

If you’re prefer not to install Grind’s installer, you can quickly clone one of Grind’s example repositories to get started:

- [https://github.com/grindjs/example-web](https://github.com/grindjs/example-web)
- [https://github.com/grindjs/example-react](https://github.com/grindjs/example-react)
- [https://github.com/grindjs/example-api](https://github.com/grindjs/example-api)

```shell
git clone --depth 1 https://github.com/grindjs/example-web.git project-name
cd project-name
rm -fr .git && git init # Clear out the existing example git history and start fresh
```
