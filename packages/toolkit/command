#!/usr/bin/env bash

export ORIGINAL_WD=$(pwd)
cd "`dirname "$BASH_SOURCE"`"

if [[ -L "$BASH_SOURCE" ]]; then
	cd $(dirname $(readlink $BASH_SOURCE))
fi

NODE=$(which node)
NODE_VERSION=$($NODE -v)
NODE_VERSION=$(echo ${NODE_VERSION#*v} | cut -d. -f1)

FLAGS=""
LIB_DIR="lib/lts"
if [ "$NODE_VERSION" -gt "6" ]; then
	FLAGS="--harmony-async-await"
	LIB_DIR="lib/node7"
fi

cd "$LIB_DIR"
exec $NODE boot/Cli.js "$@"
