import { Component, OnInit, Input } from '@angular/core';
import { TabControlService } from '../shared/tab-control.service';
import { ErrorHandlerService } from '../shared/error-handler.service';
import { VirtualFsService } from '../virtual-fs.service';

interface ConsoleErrorMessage {
  fileName: string;
  errors: any[];
}

@Component({
  selector: 'app-error-console',
  templateUrl: './error-console.component.html',
  styleUrls: ['./error-console.component.css']
})
export class ErrorConsoleComponent {

  errorList: ConsoleErrorMessage[];

  private setErrors(_errorObject: any) {
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

@Component({
  'selector': 'error-display',
  template: `
    <md-card>
      <md-card-title>{{error.fileName}}</md-card-title>
      <md-list dense>
        <md-list-item *ngFor="let e of error.errors" (click)="errorSelected($event, e)">
          <md-icon>highlight_off</md-icon>{{e.message}} ({{e.lineNumber}}, {{e.characterNumber}})
        </md-list-item>
      </md-list>
    </md-card>

  `
})
export class ErrorDisplayComponent {
  @Input() error: ConsoleErrorMessage;

  constructor(private tabControl: TabControlService,
              private fsService: VirtualFsService,
              private errorHandler: ErrorHandlerService) {}

  errorSelected(event: Event, specificError: any) {
    console.log(event, this.error, specificError);

    if (this.fsService.fileExists(specificError.fileName)) {
      this.errorHandler.targetSpecificError(specificError);
    }
  }
}
