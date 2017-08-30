import {WorkerMessageType} from '../../app/compiler.service';
import * as ts from 'typescript'
import {componentDefault, mainDefault, templateDefault} from '../../app/virtual-fs.service';

const workerPath = '/base/src/assets/compiler/worker/test-wrapper.js';

type doneFunc = () => void;

describe('compiler worker instantiation', () => {

  beforeEach(() => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 30000;
  })

  it('should instantiate', (done) => {
    const worker = new Worker(workerPath);
    expect(worker).toBeTruthy();
    worker.terminate();
    done();
  });

  it('should send an instantiation message', (done: doneFunc) => {
    const worker = new Worker(workerPath);
    worker.onmessage = (message) => {
      expect(message.data.type).toEqual(WorkerMessageType.INSTANTIATION_COMPLETE);
      worker.terminate();
      done();
    }
  })
});

const startExpectedSuccesfulWorker = (done: doneFunc): Worker => {
  const worker = new Worker(workerPath);
    // make sure compilation didn't fail
    worker.onmessage = (message) => {
      expect(message.data.type).not.toEqual(WorkerMessageType.COMPILATION_ERROR);
      expect(message.data.type).not.toEqual(WorkerMessageType.COMPILATION_START);

      // only finish the test when we get a message that compilation ended
      if (message.data.type === WorkerMessageType.COMPILATION_END) {
        worker.terminate();
        done();
      }
    }

  return worker;
}

const startExpectedCompilationFailWorker = (done: doneFunc, errorChecker?: (errors: any) => boolean): Worker => {
  const worker = new Worker(workerPath);
  // make sure compilation didn't pass
  worker.onmessage = (message) => {
    expect(message.data.type).not.toEqual(WorkerMessageType.COMPILATION_END);
    expect(message.data.type).not.toEqual(WorkerMessageType.COMPILATION_START);

    // only finish the test when we get a message that compilation errored
    if (message.data.type === WorkerMessageType.COMPILATION_ERROR) {
      worker.terminate();

      if (errorChecker) {
        expect(errorChecker(message.data.data)).toBeTruthy();
      }

      done();
    }
  }
  return worker;
}

describe('compilation sanity checks', () => {
  beforeEach(() => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 30000;
  })

  it('should succesfully compile empty file system', (done: doneFunc) => {

    const worker = startExpectedSuccesfulWorker(done);

    worker.postMessage({
      type: WorkerMessageType.COMPILATION_START,
      data: {}
    });
  });

  it('should succesfully compile a single file', (done: doneFunc) => {
    const worker = startExpectedSuccesfulWorker(done);

    worker.postMessage({
      type: WorkerMessageType.COMPILATION_START,
      data: {
        'foo.ts': ts.createSourceFile('foo.ts', 'console.log(`foo`)',
          ts.ScriptTarget.ES2015),
      }
    })
  });

  it('should succcessfully compile a minimal angular example', (done: doneFunc) => {
    const worker = startExpectedSuccesfulWorker(done);

    worker.postMessage({
      type: WorkerMessageType.COMPILATION_START,
      data: {
        '/component.ts': ts.createSourceFile('/component.ts', componentDefault,
                ts.ScriptTarget.ES2015),
        '/main.ts': ts.createSourceFile('/main.ts', mainDefault,
                ts.ScriptTarget.ES2015),
        '/component.ng.html': ts.createSourceFile('/component.ng.html',
                templateDefault, ts.ScriptTarget.ES2015),
      }
    });
  });

  it('should fail compilation when no component', (done: doneFunc) => {

    const errorChecker = (errors: any) => {
      if (Object.keys(errors).includes('General errors') && errors['General errors']) {
        return errors['General errors'][0].message ===
            'Unexpected value \'undefined\' declared by the module \'MainModule in /component.ts\'';
      }

      return false;
    }

    const worker = startExpectedCompilationFailWorker(done);

    worker.postMessage({
      type: WorkerMessageType.COMPILATION_START,
      data: {
        '/component.ts': ts.createSourceFile('/component.ts', `import {BrowserModule} from '@angular/platform-browser';
import {Component, NgModule, ApplicationRef} from '@angular/core';

@NgModule({
  imports: [BrowserModule],
  declarations: [HelloWorldComponent],
  entryComponents: [HelloWorldComponent],
  bootstrap: [HelloWorldComponent]
})
export class MainModule {
}`,
                ts.ScriptTarget.ES2015),
        '/main.ts': ts.createSourceFile('/main.ts', mainDefault,
                ts.ScriptTarget.ES2015),
        '/component.ng.html': ts.createSourceFile('/component.ng.html',
                templateDefault, ts.ScriptTarget.ES2015),
      }
    });
  })
})
