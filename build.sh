#!/bin/bash
echo "Running Thunderbird Chiptune Composer build..."
mkdir -p dist
cp index.html dist/
cp -r assets dist/
cp -r styles dist/

# Bundle and minify JavaScript using esbuild if available
if command -v npx >/dev/null 2>&1; then
  npx --yes esbuild src/main.js --bundle --minify --outfile=dist/main.bundle.js
else
  cp -r src dist/
fi

cp config.json dist/
cp serviceWorker.js dist/

echo "Generating asset hashes..."
find dist -type f | while read f; do
  sha=$(sha1sum "$f" | cut -d' ' -f1)
  echo "${f#dist/}:$sha" >> dist/asset-hashes.txt
done
echo "Files copied to ./dist/"
echo "Build complete."
