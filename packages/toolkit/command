#!/usr/bin/env bash

export ORIGINAL_WD=$(pwd)
cd "`dirname "$BASH_SOURCE"`"

if [[ -L "$BASH_SOURCE" ]]; then
	cd $(dirname $(readlink $BASH_SOURCE))
fi

NODE=$(which node)

cd "lib"
exec $NODE boot/Cli.js "$@"
