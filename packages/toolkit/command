#!/usr/bin/env bash

VERSION=$(node -v)
VERSION=$(echo ${VERSION#*v} | cut -d. -f1)

FLAGS=""
if [ "$VERSION" -gt "6" ]; then
	FLAGS="--harmony-async-await"
fi

node $FLAGS lib/boot/Cli.js $@
