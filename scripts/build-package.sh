#!/usr/bin/env bash

rm -fr lib
exec babel --root-mode upward -s inline -d lib/ src/ --copy-files
