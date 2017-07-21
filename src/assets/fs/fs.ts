// import 'vfs';

import * as virtual_file_system from './vfs';

export let vfs = new virtual_file_system.FileSystem();

export function writeFileSync(filename, data) {
  vfs.writeFile(filename, data);
}

export function statSync(directoryName) { return true; }

export function loadFilesIntoFileSystem(fileSystemData: { [key: string]: {} }): void {
  vfs.loadFilesIntoFileSystem(fileSystemData);
}

export function readFileSync(filename: string): string {
  return vfs.getSourceFile(filename).text;
}

export function getSourceFile(filename: string) {
  return vfs.getSourceFile(filename);
}

export function fileExists(filename: string): boolean {
  return vfs.fileExists(filename);
}

export function buildVfs(): virtual_file_system.FileSystem {
  return new virtual_file_system.FileSystem();
}

export function setVfs(newfs: virtual_file_system.FileSystem) {
  vfs = newfs;
}
