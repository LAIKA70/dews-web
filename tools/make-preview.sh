#!/bin/sh
# Copies the current app into preview/ so a branch can be tried on real phones at
# https://laika70.github.io/dews-web/preview/ without touching the live version.
# Run from the repo root on main:  git checkout <branch> -- <files>; sh tools/make-preview.sh
set -e
rm -rf preview && mkdir -p preview/data preview/lib
cp app.js app.css nav.js content.js warnings.js sw.js manifest.webmanifest icon.svg icon-192.png icon-512.png preview/
cp lib/* preview/lib/ && cp data/places-sydney.json preview/data/
for d in mobile tablet desktop; do mkdir -p preview/$d && cp $d/index.html preview/$d/; done
# own cache name so the preview never deletes the live version's offline copy (and vice versa)
sed -i "s/'dews-v/'dews-preview-v/; s/indexOf('dews-v')/indexOf('dews-preview-v')/; s#, './v1/', './v1/index.html'##" preview/sw.js
for f in preview/mobile/index.html preview/tablet/index.html preview/desktop/index.html; do
  sed -i 's#<title>DEWS#<title>DEWS 测试版 Preview#; s#<head>#<head>\n<meta name="robots" content="noindex">#' $f
  sed -i 's#<div id="app"></div>#<div style="background:\#5b3fa0;color:\#fff;font:600 13px/1.4 system-ui;padding:6px 12px;text-align:center">测试版 Preview — 不是正式版 · Not the live app</div>\n<div id="app"></div>#' $f
done
printf '<!doctype html><meta charset="utf-8"><meta name="robots" content="noindex"><meta name="viewport" content="width=device-width,initial-scale=1"><title>DEWS Preview</title><body style="font:16px system-ui;padding:24px"><h1>DEWS 测试版 Preview</h1><p><a href="mobile/">手机版 Mobile</a> · <a href="tablet/">平板版 Tablet</a> · <a href="desktop/">电脑版 Desktop</a></p><p><a href="../">正式版 Live app</a></p>' > preview/index.html
echo preview ready
