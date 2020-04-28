#!/usr/bin/env bash
exec babel --root-mode upward -s inline -d lib/ src/ --copy-files --delete-dir-on-start
