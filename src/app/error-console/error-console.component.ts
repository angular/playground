import { Component, OnInit, Input } from '@angular/core';
import { TabControlService } from '../shared/tab-control.service';
import { ErrorHandlerService } from '../shared/error-handler.service';
import { VirtualFsService } from '../virtual-fs.service';

@Component({
  selector: 'app-error-console',
  templateUrl: './error-console.component.html',
  styleUrls: ['./error-console.component.css']
})
export class ErrorConsoleComponent {

  errorList: any[];

  private setErrors(_errorObject) {
    this.errorList = Object.keys(_errorObject).map(filename => {
      return {
        "fileName": filename,
        "errors": _errorObject[filename]
      }
    });
  }

  constructor(private tabControlService: TabControlService,
              private fsService: VirtualFsService,
              private errorHandler: ErrorHandlerService)
  {
    this.errorHandler.$errorsGenerated.subscribe(this.setErrors.bind(this));
  }

}
