import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, Input, Output, forwardRef, EventEmitter } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import {Headers, Http} from '@angular/http';
import {VirtualFsService} from '../virtual-fs.service';

import 'rxjs/add/operator/toPromise';

declare const monaco: any;
declare const require: any;

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

export class MonacoRawComponent implements OnInit, AfterViewInit {

  @ViewChild('editor') editorContent: ElementRef;

  @Input() set language(l:string) {
    this._language = l;
    if (this._editor) {
      monaco.editor.setModelLanguage(this._editor.getModel(), l);
    }
  }

  @Input() set value(v:string) {
    if (v !== this._value) {
      this._value = v;
      this.onChange(v);
      this.writeValue(v);
    }
  }

  @Input() set errorLines(lines: number[]) {
    this.setErrorDecorationsAtLines(lines.filter((v,i) => lines.indexOf(v) == i));
  }

  @Output() change = new EventEmitter();

  @Output() instance = null;

  private _editor: any;
  private _value = '';
  private _language = '';
  private decorations = [];

  constructor(private http: Http, private fsService: VirtualFsService) {}

  get value():string { return this._value; };

  ngOnInit() {
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

    let model = monaco.editor.createModel(this._value, this._language,
                                          new monaco.Uri("file://foo.ts"))

    this._editor = monaco.editor.create(myDiv, {
      model: model,
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
            if (filename.indexOf("node_modules/") != 0 ||
                filename.indexOf("/typescript/") != -1)
            {
              continue;
            }
            monaco.languages.typescript.typescriptDefaults.addExtraLib(
              fileSystem[filename].text,
              filename
            );
          }
        });

    this._editor.getModel().onDidChangeContent( (e)=>
    {
      this.updateValue(this._editor.getModel().getValue());
    });
    this._editor.getModel().setValue(this._value);
  }

  setErrorDecorationsAtLines(lines: number[]) {
    if (this._editor) {
      // this._editor.deltaDecorations(this.decorations, []);
      this.decorations = this._editor.deltaDecorations(this.decorations, lines.map(num => {
        return {
          range: new monaco.Range(num, 1, num, 1),
          options: {
            isWholeLine: true,
            className: 'editorErrorDecoration'
          }
        }
      }));
    }
  }

  /**
   * UpdateValue
   *
   * @param value
   */
  updateValue(value:string)
  {
    this.value = value;
    this.onChange(value);
    this.onTouched();
    this.change.emit(value);
  }

  /**
   * WriteValue
   * Implements ControlValueAccessor
   *
   * @param value
   */
  writeValue(value:string)
  {
    this._value = value || '';
    if (this.instance)
    {
      this.instance.setValue(this._value);
    }
    // If an instance of Monaco editor is running, update its contents
    if(this._editor)
    {
      this._editor.getModel().setValue(this._value);
    }
  }

  onChange(_){}
  onTouched(){}
  registerOnChange(fn){this.onChange = fn;}
  registerOnTouched(fn){this.onTouched = fn;}

}
