import { Component, EventEmitter, Output } from '@angular/core';
import { VirtualFsService } from '../virtual-fs.service';
import { TabControlService } from '../shared/tab-control.service';
import { ErrorHandlerService } from '../shared/error-handler.service';

interface EditorConfigurations {
  language: string;
}

interface TabState {
  editorConfig: EditorConfigurations;
  filename: string;
}

@Component({
  selector: 'app-monaco-editor',
  templateUrl: './monaco-editor.component.html',
  styleUrls: ['./monaco-editor.component.css']
})
export class MonacoEditorComponent {

  @Output() fileChange: EventEmitter<object> = new EventEmitter();

  currentTab: TabState = null;
  currentTabIndex: number;
  fileErrorMessages: any[] = [];
  tabs: TabState[] = [];

  constructor(public fsService: VirtualFsService, private tabControlService: TabControlService, private errorHandler: ErrorHandlerService) {
    tabControlService.tabCreated$.subscribe(this.createNewTab.bind(this));
    tabControlService.tabClosed$.subscribe(this.handleTabClose.bind(this, null));
    errorHandler.$errorsGenerated.subscribe((errors: {}) => {
      for (let filename of Object.keys(errors)) {
        if (this.fsService.fileExists(filename)) {
          this.fileErrorMessages = errors[filename];
          this.tabControlService.createTab(filename);
          return;
        }
      }
    });
  }

  changeEvent(value: string) {
    // sometimes an Event gets passed - not sure why
    // TODO: fix this
    if (typeof value == "object")
      return;

    if (this.currentTab)
      this.fsService.writeFile(this.currentTab.filename, value);
  }

  createNewTab(filename: string) {
    for (let i = 0; i < this.tabs.length; i++) {
      if (this.tabs[i].filename === filename) {
        this.currentTab = this.tabs[i];
        this.currentTabIndex = i;
        return;
      }
    }

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
    this.tabs.push({
      editorConfig: {language: language},
      filename: filename
    });
    this.currentTab = this.tabs[this.tabs.length - 1];
    this.currentTabIndex = this.tabs.length - 1;
  }

  handleTabChange(event) {
    this.currentTab = this.tabs[event.index];
  }

  handleTabClose(event, filename) {
    for (let i = 0; i < this.tabs.length; i++) {
      let curFname = this.tabs[i].filename;
      if (curFname == filename) {

        this.tabs.splice(i, 1);

        if (this.currentTab.filename == curFname) {
          this.currentTab = this.tabs[0];
        }

        return;
      }
    }
  }
}
