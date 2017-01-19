---
title: "Installation"
excerpt: ""
---
Getting your environment setup for Grind is a quick process that shouldn’t take you more than a few minutes.  Just follow the simple steps below and you’ll be building your first Grind app is no time!
[block:api-header]
{
  "type": "basic",
  "title": "Requirements"
}
[/block]
Grind doesn’t need much, just make sure you’re running Node v5+ and NPM v3+.

For information on how to install Node on your OS, head over to [nodejs.org](https://nodejs.org/). For macOS, if you already have `brew` installed, just run `brew install node`.

Beyond that, it’s _highly_ recommended you install build tools in order to use npm packages with native extensions.
* For macOS users, install the Xcode command line tools via `/usr/bin/xcode-select --install`
* For Ubuntu/Debian users, install build tools via `apt-get install -y build-essential`
[block:api-header]
{
  "type": "basic",
  "title": "Installing Grind’s Installer"
}
[/block]
While not required, `grind-installer` is recommended.  Once installed, it provides the easiest way to get started on a new Grind project.

To install it, run the following npm command:
[block:code]
{
  "codes": [
    {
      "code": "npm install -g grind-installer",
      "language": "shell",
      "name": ""
    }
  ]
}
[/block]