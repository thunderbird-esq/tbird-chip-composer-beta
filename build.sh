#!/bin/bash
echo "Running Thunderbird Chiptune Composer build..."
mkdir -p dist
cp index.html dist/
cp -r assets dist/
cp -r styles dist/
cp -r src dist/
cp config.json dist/
echo "Files copied to ./dist/"
echo "NOTE: Minification and SHA256 validation not yet implemented."
