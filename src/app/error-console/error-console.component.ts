import {Component, Input, OnInit} from '@angular/core';

import {
  ErrorHandlerService,
  ParsedDiagnostic
} from '../shared/error-handler.service';
import {TabControlService} from '../shared/tab-control.service';
import {VirtualFsService} from '../virtual-fs.service';

interface ConsoleErrorMessage {
  fileName: string;
  errors: any[];
}

@Component({
  selector : 'app-error-console',
  templateUrl : './error-console.component.html',
  styleUrls : [ './error-console.component.css' ]
})
export class ErrorConsoleComponent {

  errorList: ConsoleErrorMessage[];

  private setErrors(diagnostics: ParsedDiagnostic[]) {
    const errorsByFilename: {[filename: string]: ParsedDiagnostic[]} = {};
    const errorListByFilename: ConsoleErrorMessage[] = [];

    for (const diagnostic of diagnostics) {
      if (!errorsByFilename[diagnostic.filename]) {
        errorsByFilename[diagnostic.filename] = [];
      }
      errorsByFilename[diagnostic.filename].push(diagnostic);
    }

    this.errorList = Object.keys(errorsByFilename).map(filename => {
      return { fileName: filename, errors: errorsByFilename[filename] }
    });
  }

  constructor(private tabControlService: TabControlService,
              private fsService: VirtualFsService,
              private errorHandler: ErrorHandlerService) {
    this.errorHandler.$errorsGenerated.subscribe(this.setErrors.bind(this));
  }
}

@Component({
  'selector' : 'app-error-display',
  template : `
    <md-card>
      <md-card-title>{{error.fileName}}</md-card-title>
      <md-list dense>
        <md-list-item *ngFor='let e of error.errors' (click)='errorSelected($event, e)'>
          <md-icon>highlight_off</md-icon>{{e.message}} ({{e.line}}, {{e.character}})
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
