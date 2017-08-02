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

@Injectable()
export class VirtualFsService {

  private urlWorker: Worker;

  constructor() {

    this.urlWorker = new Worker("/assets/sharing/url-worker.js");
    this.urlWorker.onmessage = function(message) {
      history.replaceState(undefined, '', message.data);
    }

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

  writeFile(filename: string, fileContents: string, dontUpdateUrl?: boolean): void {
    fs.writeFileSync(filename, fileContents);

    if (!dontUpdateUrl)
      this.updateUrlWorker();
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
    <!--
      The below scripts will be provided in the iframe for you. There is no
      need to add them in.
    -->

    <!--<script type="text/javascript"
      src='https://unpkg.com/core-js@2.4.1/client/shim.min.js'><\/script>-->
    <!--<script type="text/javascript"
      src="https://unpkg.com/zone.js/dist/zone.js"><\/script>-->
  </head>
  <body>
    <hello-world-app>
      Loading...
    </hello-world-app>
  </body>
</html>
    `);

    this.writeFile("/main.ts", `
import { platformBrowser } from '@angular/platform-browser';
import { MainModuleNgFactory } from './component.ngfactory';

console.log('Running AOT compiled');
platformBrowser().bootstrapModuleFactory(MainModuleNgFactory);
    `);
  }

}
