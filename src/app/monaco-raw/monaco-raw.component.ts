import { Component, ViewChild, ElementRef, AfterViewInit, Input, Output, forwardRef, EventEmitter } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { Headers, Http } from '@angular/http';
import { VirtualFsService } from '../virtual-fs.service';

import 'rxjs/add/operator/toPromise';

declare const monaco: any;
declare const require: any;
declare const window: any;
declare const document: any;

@Component({
  selector: 'app-monaco-raw',
  templateUrl: './monaco-raw.component.html',
  styleUrls: ['./monaco-raw.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MonacoRawComponent),
      multi: true
    }
  ],
})
export class MonacoRawComponent implements AfterViewInit {

  @ViewChild('editor') editorContent: ElementRef;

  @Input() set language(language: string) {
    this._language = language;
    if (this._editor) {
      monaco.editor.setModelLanguage(this._editor.getModel(), language);
    }
  }

  @Input() set value(v: string) {
    if (v !== this._value) {
      this._value = v;
      // this.onChange(v);
      this.writeValueToMonaco(v);
    }
  }

  @Input() set fileErrorMessages(errors: any[]) {
    let markers = errors.filter(error => error.type === "TEMPLATE_PARSE_ERROR")
      .map(error => {
        return {
          severity: monaco.Severity.Error,
          code: null,
          source: null,
          startLineNumber: error.lineNumber,
          startColumn: 1,
          endLineNumber: error.lineNumber,
          endColumn: error.characterNumber,
          message: error.message
        }
      });

    if (this.model && markers.length > 0) {
      monaco.editor.setModelMarkers(this.model, this._language, markers);
    }
  }

  @Output() change = new EventEmitter();

  private _editor: any;
  private _value = '';
  private _language = '';
  private decorations = [];
  private model = null;

  constructor(private http: Http, private fsService: VirtualFsService) { }

  get value(): string {
    return this._value;
  }

  ngAfterViewInit() {

    var onGotAmdLoader = () => {
      // Load monaco
      (<any>window).require.config({ paths: { 'vs': 'assets/monaco/vs' } });
      (<any>window).require(['vs/editor/editor.main'], () => {
        this.initMonaco();
      });
    };

    // Load AMD loader if necessary
    if (!(<any>window).require) {
      var loaderScript = document.createElement('script');
      loaderScript.type = 'text/javascript';
      loaderScript.src = 'assets/monaco/vs/loader.js';
      loaderScript.addEventListener('load', onGotAmdLoader);
      document.body.appendChild(loaderScript);
    } else {
      onGotAmdLoader();
    }
  }

  // Will be called once monaco library is available
  initMonaco() {
    var myDiv: HTMLDivElement = this.editorContent.nativeElement;

    this.model = monaco.editor.createModel(this._value, this._language,
      new monaco.Uri("file://foo.ts"))

    this._editor = monaco.editor.create(myDiv, {
      model: this.model,
      minimap: {enabled: false}
    });

    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.ES2015,
      allowNonTsExtensions: true,
      experimentalDecorators: true,
      noImplicitAny: true,
      moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      module: monaco.languages.typescript.ModuleKind.CommonJS,
      typeRoots: ["node_modules/"]
    });

    this.http.get("/assets/compiler/compiler_bundle.json")
      .toPromise()
      .then(response => {
        let fileSystem = response.json().fileSystem;
        let fileNames = Object.keys(fileSystem);
        for (let filename of fileNames) {
          // we don't want to load in anything that's not a dependency or that
          // is a typescript .d.ts
          if (filename.indexOf("node_modules/") != 0 ||
            filename.indexOf("/typescript/") != -1) {
            continue;
          }
          monaco.languages.typescript.typescriptDefaults.addExtraLib(
            fileSystem[filename].text,
            filename
          );
        }
      });

    this._editor.getModel().onDidChangeContent((e) => {
      this.sendFileUpdatedEvent(this._editor.getModel().getValue());
    });
    this._editor.getModel().setValue(this._value);
  }

  sendFileUpdatedEvent(value: string) {
    this.change.emit(value);
  }

  writeValueToMonaco(value: string) {
    this._value = value || '';
    // If an instance of Monaco editor is running, update its contents
    if (this._editor) {
      this._editor.getModel().setValue(this._value);
    }
  }
}
