import { Component, OnInit, Input } from '@angular/core';
import { TabControlService } from '../shared/tab-control.service';
import { VirtualFsService } from '../virtual-fs.service';

@Component({
  selector: 'app-error-console',
  templateUrl: './error-console.component.html',
  styleUrls: ['./error-console.component.css']
})
export class ErrorConsoleComponent {

  _errorList: any[];

  @Input() set errors(_errorObject) {

    this._errorList = Object.keys(_errorObject).map(filename => {
      return {
        "fileName": filename,
        "errors": _errorObject[filename]
      }
    });

    for (let error of this._errorList) {
      if (this.fsService.fileExists(error.fileName)) {
        this.tabControlService.createTab(error.fileName);
        this.tabControlService.setFileErrors(error.errors);
      }
    }
  }

  constructor(private tabControlService: TabControlService,
    private fsService: VirtualFsService) { }

}
