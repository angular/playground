import {
  Component, Input, Output, EventEmitter, OnInit,
  ViewChild, ElementRef
} from '@angular/core';
import { Headers, Http } from '@angular/http';

declare const monaco: any;

declare const window: {
  [monaco: string]: any;
  prototype: Window;
  new(): Window;
}

@Component({
  selector: 'app-monaco-raw',
  templateUrl: './monaco-raw.component.html',
  styleUrls: ['./monaco-raw.component.css'],
})
export class MonacoRawComponent implements OnInit {
  @Input() set model(_model: any) {

    this._monacoModel = _model;

    if (this._editor) {
      this._editor.setModel(this._monacoModel);
      this.setContentChangeEmitter();
    }
  }

  @Output() monacoInitialized: EventEmitter<any> = new EventEmitter();
  @Output() change: EventEmitter<any> = new EventEmitter();

  @ViewChild('editor') editorContent: ElementRef;
  private _monacoModel: any;
  private _editor: any;

  constructor(private http: Http) { }

  ngOnInit() {
    const onGotAmdLoader = () => {
      // Load monaco
      (<any>window).require.config({ paths: { 'vs': 'assets/monaco/vs' } });
      (<any>window).require(['vs/editor/editor.main'], () => {
        this.initMonaco();
      });
    };

    // Load AMD loader if necessary
    if (!(<any>window).require) {
      const loaderScript = document.createElement('script');
      loaderScript.type = 'text/javascript';
      loaderScript.src = 'assets/monaco/vs/loader.js';
      loaderScript.addEventListener('load', onGotAmdLoader);
      document.body.appendChild(loaderScript);
    } else {
      onGotAmdLoader();
    }
  }

  private initMonaco() {
    window['monaco'] = monaco;
    const myDiv: HTMLDivElement = this.editorContent.nativeElement;

    this._editor = monaco.editor.create(myDiv, {
      model: this._monacoModel,
      minimap: {enabled: false}
    });

    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.ES2015,
      allowNonTsExtensions: true,
      experimentalDecorators: true,
      noImplicitAny: true,
      moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      module: monaco.languages.typescript.ModuleKind.CommonJS,
      typeRoots: ['node_modules/'],
      plugins: [
        {'name': '@angular/language-service'}
      ]
    });

    this.http.get('/assets/compiler/built/compiler_bundle.json')
      // .toPromise()
      .subscribe(response => {
        const fileSystem = response.json().fileSystem;
        const fileNames = Object.keys(fileSystem);
        for (const filename of fileNames) {
          // we don't want to load in anything that's not a dependency or that
          // is a typescript .d.ts
          if (filename.indexOf('node_modules/') !== 0 ||
            filename.indexOf('/typescript/') !== -1) {
            continue;
          }
          monaco.languages.typescript.typescriptDefaults.addExtraLib(
            fileSystem[filename].text,
            filename
          );
        }
      });

    this.setContentChangeEmitter();

    this.monacoInitialized.emit();
  }

  private setContentChangeEmitter() {
    console.log('setting content change emitter!');
    if (this._editor) {
      this._editor.getModel().onDidChangeContent((e: Event) => {
        const value = this._editor.getModel().getValue();
        this.change.emit(value);
      })
    }
  }
}
