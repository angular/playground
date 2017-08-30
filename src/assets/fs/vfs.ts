/**
 * Provides a simple interface that mimics a virtual file system in the
 * browser. Implemented as a simple flat file system.
 * @module
 */

import * as ts from 'typescript';

export interface FsInterface {
  [fileName: string]: ts.SourceFile;
}

/**
 * The FileSystem itself
 * @class FileSystem
 * @classdec Stores a representation of the file system
 */
export class FileSystem {
  /**
   * Internal dictionary used to maintain the file system
   * @member
   * @private
   */
  fileSystem: FsInterface = {};

  /**
   * Check if a file exists
   * @method
   */
  fileExists(fileName: string): boolean {
    // console.log(`vfs: fileExists on ${fileName}`)
    return fileName in this.fileSystem;
  }

  /**
   * Get a source file from the file system
   * @method
   */
  getSourceFile(fileName: string): ts.SourceFile {
    // console.log(`vfs: getSourceFile on ${fileName}`)
    return this.fileSystem[fileName];
  }

  /**
   * Get the canonical file name from a given filename - used for compatibility
   * with Angular compiler host
   * @method
   */
  getCanonicalFileName(fileName: string): string { return fileName; }

  /**
   * Writes a file to the filesystem with the given filename and data
   * @method
   */
  writeFile(fileName: string, data: string): void {
    // console.log(`vfs: writing file ${fileName}`)
    if (this.getSourceFile(fileName)) {
      this.getSourceFile(fileName).text = data;
    } else {
      this.fileSystem[fileName] = ts.createSourceFile(fileName, data, ts.ScriptTarget.ES2015);
    }
  }

  /**
   * Gets a list of files stored in the file system
   * @method
   */
  getFileList(): string[] { return Object.keys(this.fileSystem); }

  readDirectory(): string[] { return []; }

  loadFilesIntoFileSystem(fileSystemData: { [key: string]: {} }): void {
    let fsData: { [filename: string]: ts.SourceFile } = fileSystemData['fileSystem'];
    let fnames: string[] = Object.keys(fsData);

    for (let index in fnames) {
      let fileName: string = fnames[index];
      let newFileName = (fileName.indexOf('node_modules/') == 0) ? '/' + fileName : fileName;

      this.writeFile(newFileName, fsData[fileName]['text']);
    }
  }

  deleteFile(fileName: string): void {
    delete this.fileSystem[fileName];
  }
};
