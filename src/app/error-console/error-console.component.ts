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
    this._errorList = _errorObject.map(error => JSON.parse(error)).map(e => {
      return Object.keys(e).map(fname => {
        return {
          filename: fname,
          errors: e[fname]
        }
      });
    }).reduce((a,b) => a.concat(b), []);

    let firstError = this._errorList[0];
    if (firstError && firstError.fileName) {
      this.tabControlService.createTab(firstError.fileName);
      this.tabControlService.setFileErrors(firstError.errors);
    }
  }

  constructor(private tabControlService: TabControlService) { }

}
