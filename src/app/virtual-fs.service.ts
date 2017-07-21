import { Injectable } from '@angular/core';

import * as fs from '../assets/fs/fs';

class Folder {
  folderName: string;
  subFolders: {} = {};
  subFiles: File[] = [];

  constructor(_folderName) {
    this.folderName = _folderName;
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

@Injectable()
export class VirtualFsService {

  constructor() {
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

    this.writeFile("index.html", `
    <head>
      <script type="text/javascript"
        src='https://unpkg.com/core-js@2.4.1/client/shim.min.js'><\/script>
      <script type="text/javascript"
        src="https://unpkg.com/zone.js/dist/zone.js"><\/script>
    </head>
      <hello-world-app>
      Loading...
    </hello-world-app>
    `);
  }

  writeFile(filename: string, fileContents: string): void {
    fs.writeFileSync(filename, fileContents);
  }

  readFile(filename: string): string {
    return fs.readFileSync(filename);
  }

  getFsBundle() {
    return fs.vfs.fileSystem;
  }

  getHierarchicalFs(): Folder {

    let hierarchy = new Folder("/");

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
          if (!currentFolder[folderName]) {
            currentFolder.subFolders[folderName] = new Folder(folderName);
          }
          currentFolder = currentFolder.subFolders[folderName];
        }
      }
    }

    return hierarchy;
  }

}
