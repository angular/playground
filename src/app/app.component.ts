import { Component, ViewChild } from '@angular/core';
import { MdSnackBar } from '@angular/material';

import { FileSystem, FsInterface } from '../assets/fs/vfs';

import { CompilerService } from './compiler.service';
import { ErrorHandlerService } from './shared/error-handler.service';
import { VirtualFsService } from './virtual-fs.service';

function resizer(resizerID: string, mousemove: any, cursor: any) {
  const resizer: any = document.getElementById(resizerID);
  if (!resizer) {
    return;
  }
  resizer.style.cursor = cursor;
  resizer['mousemove'] = mousemove;

  resizer.onmousedown = function (e: any) {
    try {
      console.log('resizer.onmousedown(e)');
      document.documentElement.addEventListener('mousemove', resizer.doDrag,
        false);
      document.documentElement.addEventListener('mouseup', resizer.stopDrag,
        false);
    } catch (e) {
      console.error(
        'resizer.onmousedown(...) failed! Your browser does not support this feature. ' +
        e.message);
    }
  }

  resizer.doDrag =
    function (e: any) {
      if (e.which !== 1) {
        console.log('mouseup');
        resizer.stopDrag(e);
        return;
      }
      resizer.mousemove(e);
    }

  resizer.stopDrag = function (e: any) {
    console.log('stopDrag(e)');
    document.documentElement.removeEventListener('mousemove', resizer.doDrag,
      false);
    document.documentElement.removeEventListener('mouseup', resizer.stopDrag,
      false);
  }
}

function resizerX(resizerID: any, mousemove: any) {
  resizer(resizerID, mousemove, 'col-resize');
}

function resizerY(resizerID: any, mousemove: any) {
  resizer(resizerID, mousemove, 'n-resize');
}

function resizerXY(resizerID: any, mousemove: any) {
  resizer(resizerID, mousemove, 'ne-resize');
}

function resizeXInner(x: any) {
  const displayFrame: any = document.getElementById('display');
  const monacoContainer = document.getElementById('monaco');
  const container = document.getElementById('container');
  if (!displayFrame || !monacoContainer || !container) {
    return;
  }
  const widthPx =
    displayFrame.parentElement.clientWidth + container.offsetLeft - x;
  const percent = (widthPx / container.offsetWidth) * 100;
  displayFrame.style.width = percent + '%';
  monacoContainer.style.width = (100 - percent) + '%';
}

function resizeXOuter(x: any) {
  const sidenav: any = document.getElementById('sidenav');
  const content: any = document.getElementById('container');
  const container: any = document.getElementById('sidenav-container');
  if (!sidenav || !content || !container) {
    return;
  }
  const widthPx = content.parentElement.clientWidth + container.offsetLeft - x;
  const percent = (widthPx / container.offsetWidth) * 100;
  content.style.width = percent + '%';
  sidenav.style.width = (100 - percent) + '%';
}

window.onload =
  function () {
    resizerX('resizerXInner', function (e: any) { resizeXInner(e.pageX + 25); });
    resizerX('resizerXOuter', function (e: any) { resizeXOuter(e.pageX + 25); });
  }

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'edit.ng';

  @ViewChild('consoleDrawer') consoleDrawer: any;

  generatedBundle: FsInterface;

  errorClass = 'no-errors';

  constructor(public fsService: VirtualFsService,
    private compilerService: CompilerService,
    private errorHandler: ErrorHandlerService,
    private snackBar: MdSnackBar) {
    this.compilerService.compileSuccessSubject.subscribe(
      (compiledBundle: FsInterface) => {
        // console.log("Compilation successful!");
        this.generatedBundle = compiledBundle;
        this.snackBar.open('Compilation Successful!', 'Dismiss');
        this.errorHandler.receiveDiagnostics([]);
        this.errorClass = 'no-errors';
      });

    this.compilerService.compileFailedSubject.subscribe(
      (diagnostics: any[]) => {
        this.generatedBundle = {};
        this.snackBar.open('Compilation Failed!', 'Dismiss');
        this.errorHandler.receiveDiagnostics(diagnostics);
        this.errorClass = '';
      });
  }
}
