importScripts("/assets/compiler/built/typescript.js");

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
// 'use strict';
define(["require", "exports", "./language-service", "../lib/typescriptServices", "../lib/lib-ts", "../lib/lib-es6-ts"], function (require, exports, language_service_1, ts, lib_ts_1, lib_es6_ts_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Promise = monaco.Promise;
    var DEFAULT_LIB = {
        NAME: 'file:///defaultLib:lib.d.ts',
        CONTENTS: lib_ts_1.contents
    };
    var ES6_LIB = {
        NAME: 'file:///defaultLib:lib.es6.d.ts',
        CONTENTS: lib_es6_ts_1.contents
    };
    function fetchLocal(url) {
        return new Promise(function (resolve, reject) {
            var xhr = new XMLHttpRequest;
            xhr.onload = function () {
                resolve(new Response(xhr.responseText, { status: xhr.status }));
            };
            xhr.onerror = function () {
                reject(new TypeError('Local request failed'));
            };
            xhr.open('GET', url);
            xhr.send(null);
        });
    }
    var TypeScriptWorker = (function () {
        function TypeScriptWorker(ctx, createData) {
            // private _extraLibs: { [fileName: string]: string } = Object.create(null);
            this._extraLibs = {};
            this._ctx = ctx;
            this._compilerOptions = createData.compilerOptions;
            console.log('createData: ', createData)
            // console.log("Compiler options: ", this._compilerOptions);
            // this._extraLibs = createData.extraLibs;
            this._extraLibs = createData.extraLibs;
            this._languageService = ts.createLanguageService(this);
            // console.log(this._languageService);
            // console.log(ts);
            // right now this is because we're running on a file URL
            // fetch("http://localhost:8081/compiler_bundle.json").then(r => {
            // 	r.json().then((data) => {
            // 		console.log(data);
            // 		let files = Object.keys(data.fileSystem);
            // 		var i;
            // 		var num_added = 0;
            // 		for (i = 0; i < files.length; i++) {
            // 			// if (num_added > 5) {
            // 			// 	break;
            // 			// }
            // 			console.log(`file ${i} of ${files.length}`);
            // 			var filename = files[i];
            // 			if (filename.indexOf("node_modules/") != 0 ||
            // 				filename.indexOf("/typescript/") != -1)
            // 			{
            // 					continue;
            // 			}
            // 			this._extraLibs[filename] = data.fileSystem[filename].text;
            // 			// monaco.languages.typescript.typescriptDefaults.addExtraLib(
            // 			// 	data.fileSystem[filename].text,
            // 			// 	filename
            // 			// );
            // 			num_added++;
            // 		}
            // 	});
            // });
            // var xhr = new XMLHttpRequest();
            // xhr.open("GET", "/assets/compiler/built/compiler_bundle.json", false);
            // xhr.send(null);
            // var data = JSON.parse(xhr.responseText);
            // var files = Object.keys(data.fileSystem);
            // var i;
            // for (i = 0; i < files.length; i++) {
            //     // console.log("file " + i + " of " + files.length);
            //     var filename = files[i];
            //     if (filename.indexOf("node_modules/") != 0 ||
            //         filename.indexOf("/typescript/") != -1) {
            //         continue;
            //     }
            //     this._extraLibs["/" + filename] = data.fileSystem[filename].text;
            // }
            console.log(this._extraLibs);
            // console.log(this._languageService);
            var params = {
                project: {
                    projectService: {
                        logger: {
                            log: console.warn.bind(console),
                            info: console.warn.bind(console),
                        }
                    }
                },
                languageService: this._languageService,
                languageServiceHost: this,
                serverHost: {},
                config: {}
            };
            // console.log(params);
            // how the original language service bundle would be used
            //
            // const l = ls({typescript: ts, path: {}, fs: {}});
            // const ngLanguageService = l.create(params);
            var ngLanguageService = language_service_1.create(params);
            // console.log(ngLanguageService);
            this._languageService = ngLanguageService;
        }
        // --- language service host ---------------
        TypeScriptWorker.prototype.getCompilationSettings = function () {
            return this._compilerOptions;
        };
        TypeScriptWorker.prototype.getScriptFileNames = function () {
            // console.count(`getScriptFileNames() called!`);
            var models = this._ctx.getMirrorModels().map(function (model) { return model.uri.toString(); });
            var toReturn = models.concat(Object.keys(this._extraLibs));
            // console.log("returning: ", toReturn);
            return toReturn;
        };
        TypeScriptWorker.prototype._getModel = function (fileName) {
            var models = this._ctx.getMirrorModels();
            if (fileName.indexOf("node_modules/") == -1) {
                // console.log(`_getModel() called with filename: ${fileName}`);
                // console.log(models);
            }
            for (var i = 0; i < models.length; i++) {
                if (models[i].uri.toString() === fileName) {
                    return models[i];
                }
            }
            return null;
        };
        TypeScriptWorker.prototype.getScriptVersion = function (fileName) {
            var model = this._getModel(fileName);
            if (model) {
                return model.version.toString();
            }
            else if (this.isDefaultLibFileName(fileName) || fileName in this._extraLibs) {
                // extra lib and default lib are static
                return '1';
            }
        };
        TypeScriptWorker.prototype.getScriptSnapshot = function (fileName) {
            var text;
            var model = this._getModel(fileName);
            if (model) {
                // a true editor model
                text = model.getValue();
            }
            else if (fileName in this._extraLibs) {
                // static extra lib
                text = this._extraLibs[fileName];
            }
            else if (fileName === DEFAULT_LIB.NAME) {
                text = DEFAULT_LIB.CONTENTS;
            }
            else if (fileName === ES6_LIB.NAME) {
                text = ES6_LIB.CONTENTS;
            }
            else {
                return;
            }
            return {
                getText: function (start, end) { return text.substring(start, end); },
                getLength: function () { return text.length; },
                getChangeRange: function () { return undefined; }
            };
        };
        TypeScriptWorker.prototype.getScriptKind = function (fileName) {
            var suffix = fileName.substr(fileName.lastIndexOf('.') + 1);
            switch (suffix) {
                case 'ts': return ts.ScriptKind.TS;
                case 'tsx': return ts.ScriptKind.TSX;
                case 'js': return ts.ScriptKind.JS;
                case 'jsx': return ts.ScriptKind.JSX;
                default: return this.getCompilationSettings().allowJs
                    ? ts.ScriptKind.JS
                    : ts.ScriptKind.TS;
            }
        };
        TypeScriptWorker.prototype.getCurrentDirectory = function () {
            return '';
        };
        TypeScriptWorker.prototype.getDefaultLibFileName = function (options) {
            // TODO@joh support lib.es7.d.ts
            return options.target <= ts.ScriptTarget.ES5 ? DEFAULT_LIB.NAME : ES6_LIB.NAME;
        };
        TypeScriptWorker.prototype.isDefaultLibFileName = function (fileName) {
            return fileName === this.getDefaultLibFileName(this._compilerOptions);
        };
        // --- language features
        TypeScriptWorker.prototype.getSyntacticDiagnostics = function (fileName) {
            var diagnostics = this._languageService.getSyntacticDiagnostics(fileName);
            diagnostics.forEach(function (diag) { return diag.file = undefined; }); // diag.file cannot be JSON'yfied
            return Promise.as(diagnostics);
        };
        TypeScriptWorker.prototype.getSemanticDiagnostics = function (fileName) {
            var diagnostics = this._languageService.getSemanticDiagnostics(fileName);
            diagnostics.forEach(function (diag) { return diag.file = undefined; }); // diag.file cannot be JSON'yfied
            return Promise.as(diagnostics);
        };
        TypeScriptWorker.prototype.getCompilerOptionsDiagnostics = function (fileName) {
            var diagnostics = this._languageService.getCompilerOptionsDiagnostics();
            diagnostics.forEach(function (diag) { return diag.file = undefined; }); // diag.file cannot be JSON'yfied
            return Promise.as(diagnostics);
        };
        TypeScriptWorker.prototype.getCompletionsAtPosition = function (fileName, position) {
            return Promise.as(this._languageService.getCompletionsAtPosition(fileName, position));
        };
        TypeScriptWorker.prototype.getCompletionEntryDetails = function (fileName, position, entry) {
            return Promise.as(this._languageService.getCompletionEntryDetails(fileName, position, entry));
        };
        TypeScriptWorker.prototype.getSignatureHelpItems = function (fileName, position) {
            return Promise.as(this._languageService.getSignatureHelpItems(fileName, position));
        };
        TypeScriptWorker.prototype.getQuickInfoAtPosition = function (fileName, position) {
            return Promise.as(this._languageService.getQuickInfoAtPosition(fileName, position));
        };
        TypeScriptWorker.prototype.getOccurrencesAtPosition = function (fileName, position) {
            return Promise.as(this._languageService.getOccurrencesAtPosition(fileName, position));
        };
        TypeScriptWorker.prototype.getDefinitionAtPosition = function (fileName, position) {
            console.log('Typescript worker - getDefinitionAtPosition!');
            return Promise.as(this._languageService.getDefinitionAtPosition(fileName, position));
        };
        TypeScriptWorker.prototype.getReferencesAtPosition = function (fileName, position) {
            return Promise.as(this._languageService.getReferencesAtPosition(fileName, position));
        };
        TypeScriptWorker.prototype.getNavigationBarItems = function (fileName) {
            return Promise.as(this._languageService.getNavigationBarItems(fileName));
        };
        TypeScriptWorker.prototype.getFormattingEditsForDocument = function (fileName, options) {
            return Promise.as(this._languageService.getFormattingEditsForDocument(fileName, options));
        };
        TypeScriptWorker.prototype.getFormattingEditsForRange = function (fileName, start, end, options) {
            return Promise.as(this._languageService.getFormattingEditsForRange(fileName, start, end, options));
        };
        TypeScriptWorker.prototype.getFormattingEditsAfterKeystroke = function (fileName, postion, ch, options) {
            return Promise.as(this._languageService.getFormattingEditsAfterKeystroke(fileName, postion, ch, options));
        };
        TypeScriptWorker.prototype.getEmitOutput = function (fileName) {
            return Promise.as(this._languageService.getEmitOutput(fileName));
        };
        return TypeScriptWorker;
    }());
    exports.TypeScriptWorker = TypeScriptWorker;
    function create(ctx, createData) {
        return new TypeScriptWorker(ctx, createData);
    }
    exports.create = create;
});
