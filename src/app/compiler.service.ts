import { Injectable } from '@angular/core';

enum WorkerMessageType {
  COMPILATION_START,
  COMPILATION_END,
  COMPILATION_ERROR
}

interface WorkerMessage {
  type: WorkerMessageType,
  data: any
}


@Injectable()
export class CompilerService {

  private compilationResolve: (value?: {} | PromiseLike<{}>) => void;
  private compilationReject: (reason?: any) => void;

  compilerWorker: Worker;

  constructor() {
    this.compilerWorker = new Worker('/assets/compiler/compiler-worker.js');
    this.compilerWorker.onmessage = this.handleWorkerMessage.bind(this);
  }

  private handleWorkerMessage(message) {
    switch (message.data.type) {
      case WorkerMessageType.COMPILATION_START:
        console.error("Main thread received COMPILATION_START message - this shouldn't happen.");
        break;

      case WorkerMessageType.COMPILATION_END:
        console.log("Main thread received COMPILATION_END message!");
        let compiled_fs = message.data.data;
        this.compilationResolve(compiled_fs);
        break;

      case WorkerMessageType.COMPILATION_ERROR:
        console.error("COMPILATION_ERROR!");
        console.log(message.data.data);
        this.compilationReject(message.data.data);
        break;
    }
  }

  compile(filesToCompile) {
    return new Promise((resolve, reject) => {

      this.compilerWorker.postMessage({
        type: WorkerMessageType.COMPILATION_START,
        data: filesToCompile,
      });

      this.compilationResolve = resolve;
      this.compilationReject = reject;
    });
  }
}
