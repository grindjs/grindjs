#!/usr/bin/env bash
exec babel \
  --root-mode upward \
  --extensions .js,.jsx,.ts,.tsx \
  -s inline \
  -d lib/ \
  --copy-files \
  --delete-dir-on-start \
  src/
