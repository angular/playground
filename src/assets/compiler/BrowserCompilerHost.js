class BrowserCompilerHost {
  getSourceFile(fileName, languageVersion) {
    return fs.getSourceFile(fileName);
  }

  getDefaultLibFileName(options) {
    return '/node_modules/typescript/lib/lib.d.ts';
  }

  getDefaultLibLocation() { return '/node_modules/typescript/lib/'; }

  writeFile(fileName, data, writeByteOrderMark) {
    console.log(`compiler host: writing ${fileName}`);
    fs.writeFileSync(fileName, data);
  }

  getCurrentDirectory() { return '/'; }

  getDirectories(path) { return []; }

  getCanonicalFileName(fileName) { return fileName; }

  useCaseSensitiveFileNames() { return true; }

  getNewLine() { return '\n'; }

  fileExists(filename) { return fs.fileExists(filename); }

  readFile(fileName) { return fs.readFileSync(fileName); }

  trace(s) { console.log(s); }
}
