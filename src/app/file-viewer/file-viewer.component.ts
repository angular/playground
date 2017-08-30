import {Component, Input, OnInit} from '@angular/core';

import {TabControlService} from '../shared/tab-control.service';
import {VirtualFsService} from '../virtual-fs.service';

@Component({
  selector : 'app-file-viewer',
  templateUrl : './file-viewer.component.html',
  styleUrls : [ './file-viewer.component.css' ]
})
export class FileViewerComponent {

  @Input() hierarchicalFs: any;

  newFileName = '';

  constructor(private fsService: VirtualFsService,
              private tabControl: TabControlService) {}

  addNewFile(event: Event) {
    if (this.newFileName === '') {
      return;
    }
    if (this.fsService.fileExists(this.newFileName)) {
      this.tabControl.createTab(this.newFileName);
    } else {
      this.fsService.writeFile(this.newFileName, '');
      this.tabControl.createTab(this.newFileName);
    }
  }
}
