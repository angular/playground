declare var require: any;
const fs = require('fs');

import {FileSystem} from './fileSystem';

// the dependencies we want pulled into the bundle
const bundleDependencies: string[] = [
    '@angular',
    'rxjs',
    'symbol-observable',
    'tslib',
    'zone.js',
    'typescript'
];

const filesAllowed: string[] = [
    '.d.ts',
    'package.json',
    '.metadata.json'
]

const compilerBundle: FileSystem = new FileSystem();

function walkDependencies(level: number, path: string) {
    const files: string[] = fs.readdirSync(path);
    files.forEach(obj => {

        const filePath = `${path}${obj}`;

        // check if its a directory or a file
        const stat = fs.statSync(filePath);
        // if directory, walk through it recursively
        if (stat && stat.isDirectory()) {
            // if we're on the root level, check if we actually want to walk that node module
            // otherwise, just walk it
            if ((level === 0 && bundleDependencies.indexOf(obj) >= 0) || level > 0) {
                walkDependencies(level + 1, filePath + '/');
            }
        } else {
            // if we're a file and we have a file type we want to load, load the file
            for (let i = 0; i < filesAllowed.length; i++) {
                if (filePath.indexOf(filesAllowed[i]) >= 0) {
                    const fileData: string = fs.readFileSync(filePath, 'utf-8');

                    compilerBundle.writeFile(filePath, fileData);
                }
            }
        }

    });
}

walkDependencies(0, 'node_modules/');

fs.writeFileSync('compiler_bundle.json', JSON.stringify(compilerBundle));
