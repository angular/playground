import {Component, ViewChild} from '@angular/core';
import {MdSnackBar} from '@angular/material';

import {FileSystem, FsInterface} from '../assets/fs/vfs';

import {CompilerService} from './compiler.service';
import {ErrorHandlerService} from './shared/error-handler.service';
import {VirtualFsService} from './virtual-fs.service';

@Component({
  selector : 'app-root',
  templateUrl : './app.component.html',
  styleUrls : [ './app.component.css' ]
})
export class AppComponent {
  title = 'edit.ng';

  @ViewChild('consoleDrawer') consoleDrawer: any;

  generatedBundle: FsInterface;

  constructor(public fsService: VirtualFsService,
              private compilerService: CompilerService,
              private errorHandler: ErrorHandlerService,
              private snackBar: MdSnackBar) {
    this.compilerService.compileSuccessSubject.subscribe(
        (compiledBundle: FsInterface) => {
          this.generatedBundle = compiledBundle;
          this.snackBar.open('Compilation Successful!', 'Dismiss');
          this.errorHandler.setErrors({});
        });

    this.compilerService.compileFailedSubject.subscribe((error: string) => {
      this.snackBar.open('Compilation Failed!', 'Dismiss');
      this.errorHandler.setErrors(JSON.parse(error));
    });
  }
}
