import {Injectable} from '@angular/core';
import {Subject} from 'rxjs/Subject';

import * as ts from 'typescript';

export interface ParsedDiagnostic {
  filename: string;
  line: number;
  character: number;
  message: string;
}

@Injectable()
export class ErrorHandlerService {

  private errorSource = new Subject();
  private specificErrorSource = new Subject();

  public $errorsGenerated = this.errorSource.asObservable();
  public $specificErrorTargeted = this.specificErrorSource.asObservable();

  constructor() {}

  private parseTypescriptDiagnostic(diagnostic: any): ParsedDiagnostic {
    let filename = '';
    let lineNumber = 0;
    let characterNumber = 0;
    let message: any = '';

    if (diagnostic.file) {
      filename = diagnostic.file.path;
      const {line, character} =
          ts.getLineAndCharacterOfPosition(diagnostic.file, diagnostic.start);
      lineNumber = line;
      characterNumber = character;
    }

    message = diagnostic.messageText;

    while (message.messageText) {
      message = message.messageText;
    }

    return {
      filename : filename,
      line : lineNumber,
      character : characterNumber,
      message : String(message)
    };
  }

  private isAngularDiagnostic(diagnostic: any): boolean {
    return diagnostic.source === 'angular';
  }

  private parseAngularTemplateDiagnostic(diagnostic: any): ParsedDiagnostic[] {
    let messageLines: string[] = diagnostic.messageText.split('\n');
    messageLines = messageLines.filter(s => !!s).slice(1);

    const parsedAngularDiagnostics: ParsedDiagnostic[] = [];

    /*
      here we break up the multiple error messages that are concatenated
      into one message into all of the separate messages

      assumption is that the last line of a given error message will contain
      'ng://'
    */

    let currentBlock = [];

    for (let i = 0; i < messageLines.length; i++) {
      const line = messageLines[i];
      currentBlock.push(line);
      if (line.indexOf('ng://') !== -1) {
        // we have the full end of a block, so let's parse that
        const lastLine = currentBlock[currentBlock.length - 1];
        const lastLineParts = lastLine.split(':');
        const message =
            currentBlock.slice(0, currentBlock.length - 1).join('\n') +
            lastLineParts[0];
        const errorLocationInfo = lastLineParts.slice(1).join(':').split('@');
        const fileName = errorLocationInfo[0].replace(' ng://', '');
        const lineNumber = errorLocationInfo[1].split(':')[0];
        const characterNumber = errorLocationInfo[1].split(':')[1];

        parsedAngularDiagnostics.push({
          filename : fileName,
          line : Number(lineNumber) + 1,
          character : Number(characterNumber),
          message : message
        });

        currentBlock = [];
      }
    }

    return parsedAngularDiagnostics;
  }

  private parseAngularDiagnostic(diagnostic: any): ParsedDiagnostic[] {
    if (diagnostic.messageText.indexOf('Template parse errors') >= 0) {
      return this.parseAngularTemplateDiagnostic(diagnostic);
    } else {
      return [ {
        filename : 'General Errors',
        line : 0,
        character : 0,
        message : diagnostic.messageText
      } ];
    }
  }

  private parseDiagnostics(diagnostics: any[]): ParsedDiagnostic[] {
    let parsedDiagnostics: ParsedDiagnostic[] = [];
    for (const diagnostic of diagnostics) {
      if (this.isAngularDiagnostic(diagnostic)) {
        const parsedAngularDiagnostic = this.parseAngularDiagnostic(diagnostic);
        parsedDiagnostics = parsedDiagnostics.concat(parsedAngularDiagnostic);
      } else {
        parsedDiagnostics.push(this.parseTypescriptDiagnostic(diagnostic));
      }
    }
    return parsedDiagnostics;
  }

  public receiveDiagnostics(diagnostics: any[]) {
    const parsedDiagnostics = this.parseDiagnostics(diagnostics);
    this.errorSource.next(parsedDiagnostics);
  }

  public targetSpecificError(specificError: any) {
    this.specificErrorSource.next(specificError);
  }
}
