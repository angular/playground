import { Component, ViewChild } from '@angular/core';
import { VirtualFsService } from './virtual-fs.service';
import { CompilerService } from './compiler.service';


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
              private compilerService: CompilerService) { }


  compileButtonHandler(event) {
    this.consoleDrawer.nativeElement.innerText = "Compiling...";
    this.compilerService.compile(this.fsService.getFsBundle())
      .then((compiled_bundle) => {
        this.generatedBundle = compiled_bundle;
        this.consoleDrawer.nativeElement.innerText = "Compilation Successful!";
      }).catch((error) => {
        // display the error - replace with injection into an error box
        this.consoleDrawer.nativeElement.innerText = error;
      });
  }
}
