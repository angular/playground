// constants used for compilation messages
var COMPILATION_START = 0;
var COMPILATION_END = 1;
var COMPILATION_ERROR = 2;
var INSTANTIATON_COMPLETE = 3;

// import dependencies
importScripts('../CompilerWorkerMessage.js');
importScripts('../built/Reflect.js');
importScripts('../built/typescript.js');
importScripts('../built/fs_bundle.js');
importScripts('../built/path.js');
importScripts('../BrowserCompilerHost.js');
importScripts('https://google.github.io/traceur-compiler/bin/traceur.js');
importScripts('https://unpkg.com/rollup@0.45.2/dist/rollup.browser.js');

function instantiate() {
  // get the compiler dependency bundle
  var xhr = new XMLHttpRequest();
  xhr.open('GET', `${baseAssetsPath}/built/compiler_bundle.json`, false);
  xhr.send();
  fs.loadFilesIntoFileSystem(JSON.parse(xhr.responseText));

  // once the compiler dependency bundle is loaded, load the actual compiler
  importScripts('../built/browser-bundle.umd.js');

  // send a message that we are ready to compile
  postMessage({
    type: INSTANTIATON_COMPLETE,
    data: "",
  });
}

function readConfiguration(files) {
  const project = ".";
  const basePath = "/";
  let existingOptions = {};

  const virtualFsFileReader = (path) => fs.readFileSync(path);

  let tsconfig = `
    {
      "compilerOptions": {
        "module": "es2015",
        "noImplicitAny": true,
        "removeComments": true,
        "preserveConstEnums": true,
        "inlineSourceMap": true,
        "inlineSources": true,
        "traceResolution": false,
        "moduleResolution": "Node",
        "experimentalDecorators": true,
        "skipLibCheck": true,
        "outDir": "dist"
      },
      "angularCompilerOptions": {
        "genDir": "dist",
        "basePath": "/"
      },
      "files": ${JSON.stringify(files)}
    }
  `;

  let { config, error } = ts.readConfigFile('', () => tsconfig);

  const parseConfigHost = {
    useCaseSensitiveFileNames: true,
    fileExists: fs.fileExists,
    readDirectory: () => [],
    readFile: virtualFsFileReader
  };
  const parsed = ts.parseJsonConfigFileContent(config, parseConfigHost, basePath, existingOptions);

  const ngOptions = config.angularCompilerOptions || {};
  ngOptions.genDir = basePath;
  for (const key of Object.keys(parsed.options)) {
    ngOptions[key] = parsed.options[key];
  }

  return { parsed, ngOptions };
}

// cache old program used in compilation
let oldProgram = undefined;

function compile(fileBundle) {
  // delete everything that's not a dependency - gotta do this or weird things happen
  let files = fs.vfs.getFileList();
  for (i in files) {
    if (files[i].indexOf("/node_modules") != 0) {
      delete fs.vfs.fileSystem[files[i]];
    }
  }

  files = Object.keys(fileBundle);
  for (i in files) {
    var file = fileBundle[files[i]];
    fs.writeFileSync(file.fileName, file.text);
  }

  files = files.filter(s => (s.endsWith(".ts") || s.endsWith(".tsx") || s.endsWith(".d.ts")));

  const ngc = ng.compiler_cli_browser;
  const config = readConfiguration(files);
  const host = ngc.createCompilerHost({
    options: config.ngOptions,
    tsHost: new BrowserCompilerHost
  });

  const compileResult = ngc.performCompilation({
    rootNames: files,
    options: config.ngOptions,
    host: host,
    oldProgram: oldProgram
  });

  oldProgram = compileResult.program || oldProgram;

  // compilation was successful!
  if (compileResult.emitResult) {
    var i;
    files = Object.keys(fs.vfs.fileSystem);
    var dist_fs = fs.buildVfs();
    for (i = 0; i < files.length; i++) {
      if (files[i].indexOf("/dist/") == 0) {
        dist_fs.fileSystem[files[i]] = fs.vfs.getSourceFile(files[i]);
      }
    }

    postMessage({
      type: COMPILATION_END,
      data: dist_fs,
    });
  }
  else {
    postMessage({
      type: COMPILATION_ERROR,
      data: compileResult.diagnostics
    });
  }
}

function handleMessage(message) {
  switch (message.type) {
    case COMPILATION_START:
      compile(message.data);
      break;
    default:
      break;
  }
}

onmessage = function (e) {
  handleMessage(e.data);
}

instantiate();
