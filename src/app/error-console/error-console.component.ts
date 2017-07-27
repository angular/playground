import { Component, OnInit, Input } from '@angular/core';
import { TabControlService } from '../shared/tab-control.service';

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

    let firstError = this._errorList[0];
    if (firstError) {
      this.tabControlService.createTab(firstError.fileName);
      this.tabControlService.setFileErrors(firstError.errors);
    }
  }

  constructor(private tabControlService: TabControlService) { }

}
