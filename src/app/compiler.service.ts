import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';

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

  compilerWorker: Worker;

  constructor(private http: HttpClient) {
    // this.compilerWorker = new Worker('/assets/compiler/compiler-worker.js');
    this.compilerWorker =
        new Worker('/assets/compiler/worker/browser-wrapper.js');
    this.compilerWorker.onmessage = this.handleWorkerMessage.bind(this);

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/proxy_worker.js', {scope : '/'});
    } else {
      alert('Service worker not supported!');
    }
  }

  private messageServiceWorker(message: any) {
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
        return;
      }
      navigator.serviceWorker.controller.postMessage(message,
                                                     [ messageChannel.port2 ]);
    });
  }

  private handleWorkerMessage(message: any) {
    switch (message.data.type) {
    case WorkerMessageType.COMPILATION_START:
      console.error(
          'Main thread received COMPILATION_START message - this shouldn\'t happen.');
      break;

    case WorkerMessageType.COMPILATION_END:
      console.log('Main thread received COMPILATION_END message!');
      const compiled_fs = message.data.data;
      this.compilationResolve(compiled_fs);
      break;

    case WorkerMessageType.COMPILATION_ERROR:
      console.error('COMPILATION_ERROR!');
      this.compilationReject(message.data.data);
      break;
    }
  }

  private dispatchCompilation(filesToCompile: FsInterface) {
    return new Promise((resolve, reject) => {
      this.compilerWorker.postMessage(
          {type : WorkerMessageType.COMPILATION_START, data : filesToCompile});

      this.compilationResolve = resolve;
      this.compilationReject = reject;
    });
  }

  compile(filesToCompile: FsInterface) {
    return new Promise((resolve, reject) => {
      this.dispatchCompilation(filesToCompile)
          .then((compiledBundle: FileSystem) => { // compilation was successful
            const filenames = Object.keys(filesToCompile);
            for (const filename of filenames) {
              if (filename.indexOf('/dist/') !== 0) {
                compiledBundle['fileSystem']['/dist' + filename] =
                    filesToCompile[filename];
              }
            }
            this.messageServiceWorker(compiledBundle).then((r: any) => {
              if (r.ack) {
                resolve(compiledBundle);
              }
            });
          })
          .catch((data) => {reject(data)}); // compilation errored
    });
  }
}
