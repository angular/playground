#!/bin/bash

set -e # exit on error

# constants
newline="\n"
cwd=$(pwd)

echo "=====BUILDING FILE SYSTEM=========="
node_modules/typescript/bin/tsc -p src/assets/fs
cd src/assets/fs
rollup -c rollup.config.js
cd $cwd
echo "SUCCESS!"

echo "===COPYING IN COMPILER DEPS===="
cp node_modules/reflect-metadata/Reflect.js src/assets/compiler/built/
cp node_modules/typescript/lib/typescript.js src/assets/compiler/built/
cp src/assets/compiler/misc/path.js src/assets/compiler/built/
# right now the browser umd bundle of the compiler is assumed to be in
# /src/assets/compiler/browser-bundle.umd.js
# TODO: move this into the npm package of angular
cp src/assets/compiler/misc/browser-bundle.umd.js src/assets/compiler/built/
echo "SUCCESS!"

echo "===BUILDING THE COMPILER DEPENDENCY BLOB==="
cd src/assets/compiler/dependency-blob
npm install
./node_modules/typescript/bin/tsc index.ts
node index.js
mv compiler_bundle.json ../built/
rm *.js
rm -rf node_modules/
echo "SUCCESS!"
