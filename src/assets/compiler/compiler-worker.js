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

function compile(fileBundle) {
  // delete everything that's not a dependency - gotta do this or weird things happen
  let files = fs.vfs.getFileList();
  for (i in files) {
    if (files[i].indexOf("/node_modules") != 0) {
      delete fs.vfs.fileSystem[files[i]];
    }
  }

  console.log(fileBundle);

  files = Object.keys(fileBundle);
  for (i in files) {
    var file = fileBundle[files[i]];
    fs.writeFileSync(file.fileName, file.text);
  }

  console.log(fs.vfs);

  // fs.writeFileSync("/component.ts", componentFile);

  // instantiate the main.ts
  let main_ts_file = `
    import { platformBrowser } from '@angular/platform-browser';
    import { MainModuleNgFactory } from './component.ngfactory';

    console.log('Running AOT compiled');
    platformBrowser().bootstrapModuleFactory(MainModuleNgFactory);
  `;
  fs.writeFileSync("/main.ts", main_ts_file);

  try {
    // run the compiler
    ng.compiler_cli_browser.performCompilation("/", readConfiguration(".", "/"),
      new BrowserCompilerHost);
  } catch(e) {

    postMessage({
      type: COMPILATION_ERROR,
      data: String(e)
    });
    return;
  }

  // compilation is done, let's build the bundle
  makeBundle();
}

function makeBundle() {

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

      // console.log(generated.map);

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
