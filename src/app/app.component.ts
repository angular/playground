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

  constructor(public fsService: VirtualFsService,
              private compilerService: CompilerService,
              public snackBar: MdSnackBar) { }


  compileButtonHandler(event) {
    this.snackBar.dismiss();
    this.snackBar.open("Compiling...", "Dismiss");
    this.compilerService.compile(this.fsService.getFsBundle())
      .then((compiled_bundle) => {
        this.generatedBundle = compiled_bundle;
        this.snackBar.dismiss();
        this.snackBar.open("Compilation Successful!", "Dismiss");

      }).catch((error) => {
        // display the error - replace with injection into an error box
        // this.snackBar.dismiss();
        this.snackBar.open("Compilation Failed!", "Dismiss");
        this.consoleDrawer.nativeElement.innerText = error;
      });
  }
}
