// constants used for compilation messages
var COMPILATION_START = 0;
var COMPILATION_END = 1;
var COMPILATION_ERROR = 2;

// import dependencies
importScripts('CompilerWorkerMessage.js');
importScripts('xhr.js');
importScripts('Reflect.js');
importScripts('typescript.js');
importScripts('fs_bundle.js');
importScripts('path.js');
importScripts('BrowserCompilerHost.js');
importScripts('https://google.github.io/traceur-compiler/bin/traceur.js');
importScripts('https://unpkg.com/rollup@0.45.2/dist/rollup.browser.js');


// necessary globals
var port;
var window;
var previous_bundle = undefined;

function instantiate() {

  let vfs = fs.vfs;
  // get the compiler dependency bundle

  fs.loadFilesIntoFileSystem(JSON.parse(get('/assets/compiler/compiler_bundle.json')));

  importScripts('browser-bundle.umd.js');
}

function readConfiguration(project, basePath) {
  let existingOptions = {};

  const virtualFsFileReader = (path) => fs.readFileSync(path);

  let tsconfig = `
    {
      "compilerOptions": {
        "module": "es2015",
        "noImplicitAny": true,
        "removeComments": true,
        "preserveConstEnums": true,
        "sourceMap": false,
        "traceResolution": false,
        "moduleResolution": "Node",
        "experimentalDecorators": true,
        "skipLibCheck": true,
        "outDir": "dist"
      },
      "files": ["component.ts", "main.ts"],
      "angularCompilerOptions": {
        "genDir": "."
      }
    }
  `;

  let { config, error } = ts.readConfigFile('', () => tsconfig);

  const parseConfigHost = {
    useCaseSensitiveFileNames: true,
    fileExists: fs.fileExists,
    readDirectory: fs.readDirectory,
    readFile: virtualFsFileReader
  };
  const parsed = ts.parseJsonConfigFileContent(config, parseConfigHost, basePath, existingOptions);

  // Default codegen goes to the current directory
  // Parsed options are already converted to absolute paths
  const ngOptions = config.angularCompilerOptions || {};
  // Ignore the genDir option
  ngOptions.genDir = basePath;
  for (const key of Object.keys(parsed.options)) {
    ngOptions[key] = parsed.options[key];
  }

  return { parsed, ngOptions };
}

function isTsDiagnostics(diagnostics){
  return diagnostics && diagnostics[0] && (diagnostics[0].file || diagnostics[0].messageText);
}

function isNgcSyntaxError(error) {
  return error[ERROR_SYNTAX_ERROR];
}

const ERROR_SYNTAX_ERROR = 'ngSyntaxError';
const ERROR_PARSE_ERRORS = 'ngParseErrors';

function syntaxError(msg, parseErrors) {
  const error = Error(msg);
  error[ERROR_SYNTAX_ERROR] = true;
  if (parseErrors) error[ERROR_PARSE_ERRORS] = parseErrors;
  return error;
}

let api = {
  "DiagnosticCategory": [
    "Warning", "Error", "Message"
  ]
}

/* TYPESCRIPT SCRIPT PARSING STUFF */

const FILENAME_FOR_GENERAL_ERRORS = "General errors";

function formatDiagnostics(cwd, diags) {
  if (diags && diags.length) {

    let isTsErrors = isTsDiagnostics(diags);

    let errorObject = {};
    for(let i = 0; i < diags.length; i++) {
      let diag = diags[i];

      let type, fileName, lineNumber, characterNumber, message;

      if (isTsErrors) {
        type = "TYPESCRIPT_DIAGNOSTIC_ERROR";
        if (diag.file) {
          fileName = diag.file.path;
          let {line, character} = ts.getLineAndCharacterOfPosition(diag.file, diag.start);
          lineNumber = line;
          characterNumber = character;
        }
        else {
          fileName = FILENAME_FOR_GENERAL_ERRORS;
          lineNumber = characterNumber = '';
        }
        message = diag.messageText;

        if (!errorObject.hasOwnProperty(fileName)) {
          errorObject[fileName] = [];
        }

        errorObject[fileName].push({
          type: type,
          fileName: fileName,
          lineNumber: lineNumber,
          characterNumber: characterNumber,
          message: message
        });
      }
      else {
        type = "TEMPLATE_PARSE_ERROR";

        let messageLines = diag.message.split("\n").filter(s => !!s).slice(1);

        /*
          here we break up the multiple error messages that are concatenated
          into one message into all of the separate messages

          assumption is that the last line of a given error message will contain
          "ng://"
        */

        let currentBlock = [];

        for (let i = 0; i < messageLines.length; i++) {
          let line = messageLines[i];
          currentBlock.push(line);
          if (line.indexOf("ng://") != -1) {
            // we have the full end of a block, so let's parse that
            let lastLine = currentBlock[currentBlock.length - 1];
            let lastLineParts = lastLine.split(":");
            let message = currentBlock.slice(0, currentBlock.length - 1).join("\n") + lastLineParts[0];
            let errorLocationInfo = lastLineParts.slice(1).join(":").split("@");
            fileName = errorLocationInfo[0].replace(" ng://", "");
            lineNumber = errorLocationInfo[1].split(":")[0];
            characterNumber = errorLocationInfo[1].split(":")[1];

            if (!errorObject.hasOwnProperty(fileName)) {
              errorObject[fileName] = [];
            }

            errorObject[fileName].push({
              type: type,
              fileName: fileName,
              lineNumber: Number(lineNumber) + 1,
              characterNumber: Number(characterNumber),
              message: message
            });

            currentBlock = [];
          }
        }
      }


    }
    return JSON.stringify(errorObject);
  } else
    return '';
}

function handleCompilerError(e) {
  postMessage({
    type: COMPILATION_ERROR,
    data: String(e)
  });
}

function check(cwd, ...args) {
  if (args.some(diags => !!(diags && diags[0]))) {
    throw syntaxError(args.map(diags => {
                            if (diags && diags[0]) {
                              console.log("Diags in check: ", diags);
                              return formatDiagnostics(cwd, diags);
                            }
                          })
                          .filter(message => !!message)
                          .join(''));
  }
}

function compile(fileBundle) {

  console.log(`Starting compilation at: ${performance.now()}`)

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

  try {
    // run the compiler

    let {parsed, ngOptions} = readConfiguration(".", "/");

    const ngc = ng.compiler_cli_browser;
    var compilerStatus = ngc.performCompilation("/", parsed.fileNames, parsed.options,
      ngOptions, handleCompilerError, check, new BrowserCompilerHost);
  } catch(e) {
    throw e;
  }

  // compilation is done, let's build the bundle
  makeBundle();
}

function makeBundle() {

  var start_bundling_time = performance.now();
  console.log(`Starting bundling at ${start_bundling_time}`);

  // shim around window - deal with performance calls in rollup

  window = {
    "performance": {
      "now": function () {
        return 0;
      }
    },
    "btoa": btoa,
  }

  var angularVersion = "@4.2.6";

  var bundleMap = {

    'app': './src',
    '@angular/core': 'https://unpkg.com/@angular/core' + angularVersion + '/@angular/core.es5.js',
    '@angular/common': 'https://unpkg.com/@angular/common' + angularVersion + '/@angular/common.es5.js',
    '@angular/compiler': 'https://unpkg.com/@angular/compiler' + angularVersion + '/@angular/compiler.es5.js',
    '@angular/platform-browser': 'https://unpkg.com/@angular/platform-browser' + angularVersion + '/@angular/platform-browser.es5.js',
    '@angular/platform-browser-dynamic': 'https://unpkg.com/@angular/platform-browser-dynamic' + angularVersion + '/bundles/platform-browser-dynamic.umd.js',
    '@angular/http': 'https://unpkg.com/@angular/http' + angularVersion + '/bundles/http.umd.js',
    '@angular/router': 'https://unpkg.com/@angular/router' + angularVersion + '/bundles/router.umd.js',
    '@angular/forms': 'https://unpkg.com/@angular/forms' + angularVersion + '/bundles/forms.umd.js',
    '@angular/animations': 'https://unpkg.com/@angular/animations' + angularVersion + '/bundles/animations.umd.js',
    '@angular/platform-browser/animations': 'https://unpkg.com/@angular/platform-browser' + angularVersion + '/bundles/platform-browser-animations.umd.js',
    '@angular/animations/browser': 'https://unpkg.com/@angular/animations' + angularVersion + '/bundles/animations-browser.umd.js',

    '@angular/core/testing': 'https://unpkg.com/@angular/core' + angularVersion + '/bundles/core-testing.umd.js',
    '@angular/common/testing': 'https://unpkg.com/@angular/common' + angularVersion + '/bundles/common-testing.umd.js',
    '@angular/compiler/testing': 'https://unpkg.com/@angular/compiler' + angularVersion + '/bundles/compiler-testing.umd.js',
    '@angular/platform-browser/testing': 'https://unpkg.com/@angular/platform-browser' + angularVersion + '/bundles/platform-browser-testing.umd.js',
    '@angular/platform-browser-dynamic/testing': 'https://unpkg.com/@angular/platform-browser-dynamic' + angularVersion + '/bundles/platform-browser-dynamic-testing.umd.js',
    '@angular/http/testing': 'https://unpkg.com/@angular/http' + angularVersion + '/bundles/http-testing.umd.js',
    '@angular/router/testing': 'https://unpkg.com/@angular/router' + angularVersion + '/bundles/router-testing.umd.js',
    'tslib': 'https://unpkg.com/tslib@1.7.1/tslib.es6.js',
    'rxjs': 'https://unpkg.com/rxjs',
    'typescript': 'https://unpkg.com/typescript@2.2.1/lib/typescript.js',
    "rxjs/Subject": "https://unpkg.com/rxjs@5.4.2/bundles/Rx.js",
  }

  // fixes issues with rxjs bundling
  var intro = "function __extends(d,b) {__extends$1(d,b);};";

  rollup.rollup({
    entry: "/dist/main.js",
    external: [
      'rxjs'
    ],
    paths: {
      "rxjs/Subject": "https://unpkg.com/rxjs@5.4.2/bundles/Rx.js",
    },
    format: 'umd',
    cache: previous_bundle,
    treeshake: false,
    plugins: [{
      resolveId(importee, importer) {
        // handle cases like ./util/root imported by rxjs/Observable
        if (importer && importer.indexOf("rxjs") == 0 && importee.indexOf("./") == 0) {
          var base = importer.split(path.sep);
          base = base.slice(0, base.length - 1).join(path.sep) + "/";
          var loc = importee.replace("./", base);
          return loc;
        }

        if (importer && importer.indexOf("rxjs") == 0 && importee.indexOf("../") == 0) {
          var loc = "rxjs/" + importee.replace("../", "");
          return loc;
        }

        if (importer && importer.indexOf("/dist/") == 0 && importee.indexOf("./") == 0) {
          var loc = importee.replace("./", "/dist/")
          return loc;
        }

        return importee;
      },
      load: function (id) {
        // if we are in dist
        if (id.indexOf("/dist/") == 0) {
          if (id.indexOf(".js") == -1) {
            id += ".js";
          }
          return fs.readFileSync(id);
        }
        // if we're a rxjs dependency
        else if (id.indexOf("rxjs") == 0) {
          var url = "/assets/compiler/" + id + ".js";
          return get(url);
        }
        // if we're an import relative to
        else if (id.indexOf("./") == 0) {
          var newId = id.replace("./", "/dist/") + ".js";
          return fs.readFileSync(newId);
        }
        return get(bundleMap[id]);
      }
    }]
  }).then(function (bundle) {
    bundle.generate({
      "format": "umd",
      "moduleName": "angularApp",
      "intro": intro,
      "sourceMap": "inline",
    }).then(generated => {
      // write the created bundle
      fs.writeFileSync("/dist/bundle.js", generated.code);


      // now, we're done bundling, so let's generate a virtual file system for
      // only the stuff in dist

      var i;
      var files = Object.keys(fs.vfs.fileSystem);
      var dist_fs = fs.buildVfs();
      for (i = 0; i < files.length; i++) {
        if (files[i].indexOf("/dist/") == 0) {
          dist_fs.fileSystem[files[i]] = fs.vfs.getSourceFile(files[i]);
        }
      }

      postMessage({
        type: COMPILATION_END,
        data: dist_fs,
      })
    });

    // cache the generate bundle
    previous_bundle = bundle;

    var end_bundling_time = performance.now();
    console.log(`Ending bundling at ${end_bundling_time}`);
    console.log(`Bundling took ${end_bundling_time - start_bundling_time}`);
  });
}


function handleMessage(data) {
  switch (data.type) {
    case COMPILATION_START:
      compile(data.data);
      break;
    default:
      break;
  }
}

postMessage('Hello World!');

onmessage = function (e) {
  handleMessage(e.data);
}

instantiate();
