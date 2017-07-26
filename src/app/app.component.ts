import { Component, ViewChild } from '@angular/core';
import { VirtualFsService } from './virtual-fs.service';
import { CompilerService } from './compiler.service';
import { MdSnackBar } from '@angular/material';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Angular Sandbox';

  @ViewChild('consoleDrawer') consoleDrawer;

  generatedBundle;

  errorObject = {};

  constructor(public fsService: VirtualFsService,
              private compilerService: CompilerService,
              public snackBar: MdSnackBar) { }

  private setConsoleErrorMessage(error: string) {
    if (error === "") {
      this.errorObject = {}
    }
    else {
      this.errorObject = JSON.parse(error);
    }
  }

  compileButtonHandler(event) {
    this.snackBar.open("Compiling...", "Dismiss");
    this.compilerService.compile(this.fsService.getFsBundle())
      .then((compiled_bundle) => {
        this.generatedBundle = compiled_bundle;
        this.snackBar.open("Compilation Successful!", "Dismiss");
        this.setConsoleErrorMessage("");
      }).catch((error) => {
        // display the error - replace with injection into an error box
        this.snackBar.open("Compilation Failed!", "Dismiss");
        this.setConsoleErrorMessage(error);
      });
  }
}
