import { Component, OnInit, Input } from '@angular/core';

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
    console.log(this._errorList);
  }

  constructor() { }

}
