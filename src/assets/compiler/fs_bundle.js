(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('typescript')) :
	typeof define === 'function' && define.amd ? define(['exports', 'typescript'], factory) :
	(factory((global.fs = global.fs || {}),global.ts));
}(this, (function (exports,typescript) { 'use strict';

typescript = typescript && 'default' in typescript ? typescript['default'] : typescript;

function unwrapExports (x) {
	return x && x.__esModule ? x['default'] : x;
}

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var vfs = createCommonjsModule(function (module, exports) {
"use strict";
/**
 * Provides a simple interface that mimics a virtual file system in the
 * browser. Implemented as a simple flat file system.
 * @module
 */
exports.__esModule = true;

/**
 * The FileSystem itself
 * @class FileSystem
 * @classdec Stores a representation of the file system
 */
var FileSystem = (function () {
    function FileSystem() {
        /**
         * Internal dictionary used to maintain the file system
         * @member
         * @private
         */
        this.fileSystem = {};
    }
    /**
     * Check if a file exists
     * @method
     */
    FileSystem.prototype.fileExists = function (fileName) {
        // console.log(`vfs: fileExists on ${fileName}`)
        return fileName in this.fileSystem;
    };
    /**
     * Get a source file from the file system
     * @method
     */
    FileSystem.prototype.getSourceFile = function (fileName) {
        // console.log(`vfs: getSourceFile on ${fileName}`)
        return this.fileSystem[fileName];
    };
    /**
     * Get the canonical file name from a given filename - used for compatibility
     * with Angular compiler host
     * @method
     */
    FileSystem.prototype.getCanonicalFileName = function (fileName) { return fileName; };
    /**
     * Writes a file to the filesystem with the given filename and data
     * @method
     */
    FileSystem.prototype.writeFile = function (fileName, data) {
        // console.log(`vfs: writing file ${fileName}`)
        if (this.getSourceFile(fileName)) {
            this.getSourceFile(fileName).text = data;
        }
        else {
            this.fileSystem[fileName] = typescript.createSourceFile(fileName, data, typescript.ScriptTarget.ES2015);
        }
    };
    /**
     * Gets a list of files stored in the file system
     * @method
     */
    FileSystem.prototype.getFileList = function () { return Object.keys(this.fileSystem); };
    FileSystem.prototype.readDirectory = function () { return []; };
    FileSystem.prototype.loadFilesIntoFileSystem = function (fileSystemData) {
        var fsData = fileSystemData['fileSystem'];
        var fnames = Object.keys(fsData);
        for (var index in fnames) {
            var fileName = fnames[index];
            var newFileName = (fileName.indexOf('node_modules/') == 0) ? '/' + fileName : fileName;
            this.writeFile(newFileName, fsData[fileName]['text']);
        }
    };
    FileSystem.prototype.deleteFile = function (fileName) {
        delete this.fileSystem[fileName];
    };
    return FileSystem;
}());
exports.FileSystem = FileSystem;


});

var fs = createCommonjsModule(function (module, exports) {
"use strict";
// import 'vfs';
exports.__esModule = true;

exports.vfs = new vfs.FileSystem();
function writeFileSync(filename, data) {
    console.log("writing file " + filename);
    exports.vfs.writeFile(filename, data);
}
exports.writeFileSync = writeFileSync;
function statSync(directoryName) { return true; }
exports.statSync = statSync;
function loadFilesIntoFileSystem(fileSystemData) {
    exports.vfs.loadFilesIntoFileSystem(fileSystemData);
}
exports.loadFilesIntoFileSystem = loadFilesIntoFileSystem;
function readFileSync(filename) {
    return exports.vfs.getSourceFile(filename).text;
}
exports.readFileSync = readFileSync;
function getSourceFile(filename) {
    return exports.vfs.getSourceFile(filename);
}
exports.getSourceFile = getSourceFile;
function fileExists(filename) {
    return exports.vfs.fileExists(filename);
}
exports.fileExists = fileExists;
function buildVfs() {
    return new vfs.FileSystem();
}
exports.buildVfs = buildVfs;
function setVfs(newfs) {
    exports.vfs = newfs;
}
exports.setVfs = setVfs;

});

var fs$1 = unwrapExports(fs);
var fs_1 = fs.vfs;
var fs_2 = fs.writeFileSync;
var fs_3 = fs.statSync;
var fs_4 = fs.loadFilesIntoFileSystem;
var fs_5 = fs.readFileSync;
var fs_6 = fs.getSourceFile;
var fs_7 = fs.fileExists;
var fs_8 = fs.buildVfs;
var fs_9 = fs.setVfs;

exports['default'] = fs$1;
exports.vfs = fs_1;
exports.writeFileSync = fs_2;
exports.statSync = fs_3;
exports.loadFilesIntoFileSystem = fs_4;
exports.readFileSync = fs_5;
exports.getSourceFile = fs_6;
exports.fileExists = fs_7;
exports.buildVfs = fs_8;
exports.setVfs = fs_9;

Object.defineProperty(exports, '__esModule', { value: true });

})));
