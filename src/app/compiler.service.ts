import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {MdSnackBar} from '@angular/material';
import {Subject} from 'rxjs/Subject';

import {FileSystem, FsInterface} from '../assets/fs/vfs';

export enum WorkerMessageType {
  COMPILATION_START,
  COMPILATION_END,
  COMPILATION_ERROR,
  INSTANTIATION_COMPLETE
}

interface WorkerMessage {
  type: WorkerMessageType, data: any
}

@Injectable()
export class CompilerService {

  private compilationResolve: (value?: {}|PromiseLike<{}>) => void;
  private compilationReject: (reason?: any) => void;

  public compileSuccessSubject = new Subject();
  public compileFailedSubject = new Subject();

  private isCompilationInProgress = false;
  private queuedCompilation: FsInterface | null;

  compilerWorker: Worker;

  constructor(private http: HttpClient, public snackBar: MdSnackBar) {
    this.compilerWorker =
        new Worker('/assets/compiler/worker/browser-wrapper.js');
    this.compilerWorker.onmessage = this.handleWorkerMessage.bind(this);

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/proxy_worker.js', {scope : '/'});
    } else {
      alert('Service worker not supported! Please upgrade your browser.');
      window.location.replace('https://www.google.com/chrome/browser/desktop/');
    }
  }

  private messageServiceWorker(message: any) {
    console.log('messaging service worker!');
    return new Promise(function(resolve, reject) {
      const messageChannel = new MessageChannel();
      messageChannel.port1.onmessage = function(event) {
        if (event.data.error) {
          reject(event.data.error);
        } else {
          resolve(event.data);
        }
      };

      if (!navigator.serviceWorker.controller) {
        alert(`Service worker is not yet registered!
Attempting to reload the page.
If the page does not reload, please reload manually.`);
        window.location.reload(true);
        return;
      }
      navigator.serviceWorker.controller.postMessage(message,
                                                     [ messageChannel.port2 ]);
    });
  }

  private handleWorkerMessage(message: any) {
    console.log(message);
    switch (message.data.type) {
    case WorkerMessageType.COMPILATION_START:
      console.error(
          'Main thread received COMPILATION_START message - this shouldn\'t happen.');
      break;

    case WorkerMessageType.COMPILATION_END:
      // console.log('Main thread received COMPILATION_END message!');
      const compiled_fs = message.data.data;
      this.compilationResolve(compiled_fs);
      break;

    case WorkerMessageType.COMPILATION_ERROR:
      // console.error('COMPILATION_ERROR!');
      this.compilationReject(message.data.data);
      break;
    }
  }

  private dispatchCompilation(filesToCompile: FsInterface) {
    return new Promise((resolve, reject) => {
      this.isCompilationInProgress = true;
      this.compilerWorker.postMessage(
          {type : WorkerMessageType.COMPILATION_START, data : filesToCompile});

      this.compilationResolve = resolve;
      this.compilationReject = reject;
    });
  }

  private onCompilationComplete() {
    this.isCompilationInProgress = false;
    const toCompile = this.queuedCompilation;
    this.queuedCompilation = null;

    // if we have a queued compilation, then run it
    if (toCompile) {
      this.compile(toCompile);
    }
  }

  compile(filesToCompile: FsInterface) {
    this.snackBar.open('Compiling...', 'Dismiss');
    if (!this.isCompilationInProgress) {
      this.dispatchCompilation(filesToCompile)
        .then((compiledBundle: FileSystem) => {
          console.log('compilation resolve!', compiledBundle);
          const filenames = Object.keys(filesToCompile);
          for (const filename of filenames) {
            if (filename.indexOf('/dist/') !== 0) {
              compiledBundle['fileSystem']['/dist' + filename] =
                  filesToCompile[filename];
            }
          }
          this.messageServiceWorker(compiledBundle).then((r: any) => {
            console.log('received message from service worker!');
            if (r.ack) {
              this.compileSuccessSubject.next(compiledBundle);
              this.onCompilationComplete();
            }
          });
        })
        .catch((diagnostics) => {
          this.onCompilationComplete();
          this.compileFailedSubject.next(diagnostics)
        });
    } else {
      this.queuedCompilation = filesToCompile;
    }


  }
}
