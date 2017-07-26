import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-error-console',
  templateUrl: './error-console.component.html',
  styleUrls: ['./error-console.component.css']
})
export class ErrorConsoleComponent implements OnInit {

  _errorList: any[];

  @Input() set errors(errorObject) {
    this._errorList = Object.keys(errorObject).map(filename => {
      return {
        "fileName": filename,
        "errors": errorObject[filename]
      }
    });
  }

  constructor() { }

  ngOnInit() {
  }

}
