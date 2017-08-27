import { Injectable } from '@angular/core';
import { inflateRaw } from 'pako';

import * as fs from '../assets/fs/fs';

class Folder {
  folderName: string;
  fullPath: string;
  subFolders: {} = {};
  subFiles: File[] = [];

  constructor(_folderName, _fullPath) {
    this.folderName = _folderName;
    this.fullPath = _fullPath;
  }
}

class File {
  fileName: string;
  contents: string;

  constructor(_fileName, _contents) {
    this.fileName = _fileName;
    this.contents = _contents;
  }
}

interface FolderFileLevel {
  level: number;
  object: Folder | File;
}

declare let monaco: any;

@Injectable()
export class VirtualFsService {

  private urlWorker: Worker;
  private monacoModels;

  constructor() { }

  initialize() {
    if (this.urlWorker) {
      return;
    }

    this.urlWorker = new Worker("/assets/sharing/url-worker.js");
    this.urlWorker.onmessage = function(message) {
      history.replaceState(undefined, '', message.data);
    }

    this.monacoModels = {};

    if (location.hash) {
      this.loadDataFromUrlHash();
    }
    else {
      this.writeDefaultContent();
    }
  }

  private loadDataFromUrlHash() {
    let fragment = location.hash.substring(1);
    const [version, ...data] = fragment.split(",");
    const code = data.pop()!;
    // let inflated = inflateRaw(location.hash.split(",")[1]);
    let inflated = inflateRaw(
          atob(code.replace(/\./g, '+').replace(/_/g, '/')), {to: 'string'});
          // code.replace(/\./g, '+').replace(/_/g, '/'), {to: 'string'});

    const loadedFiles = JSON.parse(inflated);
    Object.keys(loadedFiles).forEach(filename => {
      this.writeFile(filename, loadedFiles[filename], true);
    });
  }

  private getLanguageFromFilename(filename: string) {
    let split = filename.split(".");
    let language = "";
    switch (split[split.length - 1]) {
      case "ts":
        language = "typescript";
        break;
      case "html":
        language = "html";
        break;
      case "js":
        language="javascript";
        break;
      case "css":
        language="css";
        break;
    }
    return language;
  }

  writeFile(filename: string, fileContents: string, dontUpdateUrl?: boolean,
            dontUpdateModel?: boolean): void {

    fs.writeFileSync(filename, fileContents);

    if (!dontUpdateUrl)
      this.updateUrlWorker();

    if (dontUpdateModel)
      return;

    // set the monaco models
    if (!(this.monacoModels[filename])) {
      const uri = new monaco.Uri();
      uri._path = uri._fsPath = filename;
      const model = monaco.editor.createModel("",
              this.getLanguageFromFilename(filename), uri);

      this.monacoModels[filename] = model;
    }

    this.monacoModels[filename].setValue(fileContents);
  }

  getMonacoModel(filename: string) {
    return this.monacoModels[filename];
  }

  deleteFile(filename: string) {
    fs.deleteFile(filename);
    this.updateUrlWorker();
  }

  readFile(filename: string): string {
    return fs.readFileSync(filename);
  }

  fileExists(filename: string): boolean {
    return fs.fileExists(filename);
  }

  getFsBundle() {
    return fs.vfs.fileSystem;
  }

  updateUrlWorker() {
    this.urlWorker.postMessage(JSON.stringify(this.getUserFileTextBundle()));
  }

  // returns the text of all the files that aren't in /node_modules/
  getUserFileTextBundle() {
    let bundle = fs.vfs.fileSystem;
    let new_bundle = {};
    Object.keys(fs.vfs.fileSystem).forEach(key => {
      if (key.indexOf("/node_modules/") == -1 && key.indexOf("/dist/") == -1) {
        new_bundle[key] = bundle[key].text;
      }
    });
    return new_bundle;
  }

  // getHierarchicalFs(): Folder {
  getHierarchicalFs() {

    let hierarchy = new Folder("/", "/");

    let files = fs.vfs.getFileList();

    for(let filename of files) {
      let path = filename.split("/").filter((part) => part !== "");
      let currentFolder: Folder = hierarchy;
      for(let i = 0; i < path.length; i++) {
        if (i == path.length - 1) {
          currentFolder.subFiles.push(new File(filename, this.readFile(filename)));
        }
        else {
          let folderName = path[i];
          if (!currentFolder.subFolders[folderName]) {
            let fullPath = "/" + path.slice(0, i + 1).join("/");
            currentFolder.subFolders[folderName] = new Folder(folderName, fullPath);
          }
          currentFolder = currentFolder.subFolders[folderName];
        }
      }
    }

    let flattened: FolderFileLevel[] =[];

    const flatten = (folder: Folder, level: number) => {
      if (folder.fullPath.indexOf("/dist") == 0) {
        return;
      }
      flattened.push({
        level: level,
        object: folder
      });
      level++;
      for (let subfile of folder['subFiles']) {
        flattened.push({
          level: level,
          object: subfile
        });
      }
      for (let subfoldername of Object.keys(folder['subFolders'])) {
        flatten(folder['subFolders'][subfoldername], level);
      }
    }

    flatten(hierarchy, 0);

    return flattened;
  }

  getFileList() {
    return fs.vfs.getFileList();
  }

  private writeDefaultContent() {
    this.writeFile("/component.ts", `import {BrowserModule} from '@angular/platform-browser';
import {Component, NgModule, ApplicationRef} from '@angular/core';

export class Hero { id: number; name: string }

const HEROES: Hero[] = [
 {id: 11, name: 'Batman'},
 {id: 12, name: 'Wonder Woman'},
 {id: 12, name: 'Iron Man'},
]

@Component({
  selector: 'hello-world-app',
  templateUrl: "./templates/template.html",
})
export class HelloWorldComponent {
  heroes = HEROES;
  selectedHero: Hero;
  onSelect(hero: Hero): void { this.selectedHero = hero; }
}

@NgModule({
  imports: [BrowserModule],
  declarations: [HelloWorldComponent],
  entryComponents: [HelloWorldComponent],
  bootstrap: [HelloWorldComponent]
})
export class MainModule {
}
    `);

    this.writeFile("/templates/template.html", `<ul class="heroes">
  <li *ngFor="let hero of heroes" (click)="onSelect(hero)">{{hero.name}}</li>
</ul>
<div *ngIf="selectedHero">
  <div><label>name: </label> {{selectedHero.name}}</div>
</div>
    `);

    this.writeFile("/index.html", `<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>Document</title>
  <script src="https://unpkg.com/core-js@2.4.1/client/shim.min.js"></script>
  <script src="https://unpkg.com/zone.js/dist/zone.js"></script>
  <script src="https://unpkg.com/zone.js/dist/long-stack-trace-zone.js"></script>
  <script src="https://unpkg.com/reflect-metadata@0.1.3/Reflect.js"></script>
  <script src="https://unpkg.com/systemjs@0.19.31/dist/system.js"></script>
  <script type="text/javascript">
    var angularVersion = '';

    System.config({
      paths: {
        'npm:': 'https://unpkg.com/'
      },
      //map tells the System loader where to look for things
      map: {
        'app': '',
        '@angular/core': 'npm:@angular/core'+ angularVersion + '/bundles/core.umd.js',
        '@angular/common': 'npm:@angular/common' + angularVersion + '/bundles/common.umd.js',
        '@angular/compiler': 'npm:@angular/compiler' + angularVersion  + '/bundles/compiler.umd.js',
        '@angular/platform-browser': 'npm:@angular/platform-browser' + angularVersion + '/bundles/platform-browser.umd.js',
        '@angular/platform-browser-dynamic': 'npm:@angular/platform-browser-dynamic' + angularVersion + '/bundles/platform-browser-dynamic.umd.js',
        '@angular/http': 'npm:@angular/http' + angularVersion + '/bundles/http.umd.js',
        '@angular/router': 'npm:@angular/router' + angularVersion +'/bundles/router.umd.js',
        '@angular/forms': 'npm:@angular/forms' + angularVersion + '/bundles/forms.umd.js',
        '@angular/animations': 'npm:@angular/animations' + angularVersion + '/bundles/animations.umd.js',
        '@angular/platform-browser/animations': 'npm:@angular/platform-browser' + angularVersion + '/bundles/platform-browser-animations.umd.js',
        '@angular/animations/browser': 'npm:@angular/animations' + angularVersion + '/bundles/animations-browser.umd.js',

        '@angular/core/testing': 'npm:@angular/core' + angularVersion + '/bundles/core-testing.umd.js',
        '@angular/common/testing': 'npm:@angular/common' + angularVersion + '/bundles/common-testing.umd.js',
        '@angular/compiler/testing': 'npm:@angular/compiler' + angularVersion + '/bundles/compiler-testing.umd.js',
        '@angular/platform-browser/testing': 'npm:@angular/platform-browser' + angularVersion + '/bundles/platform-browser-testing.umd.js',
        '@angular/platform-browser-dynamic/testing': 'npm:@angular/platform-browser-dynamic' + angularVersion + '/bundles/platform-browser-dynamic-testing.umd.js',
        '@angular/http/testing': 'npm:@angular/http' + angularVersion + '/bundles/http-testing.umd.js',
        '@angular/router/testing': 'npm:@angular/router' + angularVersion + '/bundles/router-testing.umd.js',
        'tslib': 'npm:tslib@1.6.1',
        'rxjs': 'npm:rxjs',
        'typescript': 'npm:typescript@2.2.1/lib/typescript.js',
        'traceur': 'npm:traceur/bin/traceur.js'
      },
      //packages defines our app package
      packages: {
        app: {
          main: 'main.js',
        },
        rxjs: {
          defaultExtension: 'js'
        }
      }
    });
  </script>
</head>
<body>
  <hello-world-app>Loading...</hello-world-app>
  <script type="text/javascript">
    System.import('app')
      .catch(console.error.bind(console));
  </script>
</body>
</html>`);

    this.writeFile("/main.ts", `
import { platformBrowser } from '@angular/platform-browser';
import { MainModuleNgFactory } from './component.ngfactory';

console.log('Running AOT compiled');
platformBrowser().bootstrapModuleFactory(MainModuleNgFactory);
    `);
  }

}
