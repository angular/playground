import { Component, ViewChild } from '@angular/core';
import { VirtualFsService } from './virtual-fs.service';
import { CompilerService } from './compiler.service';

interface FileEvent {
  filename: string;
  fileContents: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'AOT Playground';

  @ViewChild('iframeContainer') iframeContainer;
  @ViewChild('consoleDrawer') consoleDrawer;

  constructor(private fsService: VirtualFsService, private compilerService: CompilerService) { }

  private injectDocument(iframe, document: Document) {
    // replace the contents of the iframe
    // https://stackoverflow.com/questions/1356942/howto-replace-document-object-of-a-window-iframe
    let iframe_document = iframe.contentWindow.document;
    iframe_document.replaceChild(
      iframe_document.importNode(document.documentElement, true),
      iframe_document.documentElement
    );
  }

  private injectCompiledApp(compiled_bundle) {
    var files: string[] = Object.keys(compiled_bundle.fileSystem);

    for (let filename of files) {
      this.fsService.writeFile(filename, compiled_bundle.fileSystem[filename].text);
    }

    var html = this.fsService.readFile("index.html");

    let parser = new DOMParser();

    // delete old iframe and delete the new iframe
    let container = this.iframeContainer.nativeElement;
    while (container.hasChildNodes()) {
      container.removeChild(container.lastChild);
    }
    var iframe = document.createElement("iframe");
    container.appendChild(iframe);

    this.injectDocument(iframe, parser.parseFromString("", "text/html")); // clear the iframe
    this.injectDocument(iframe, parser.parseFromString(html, "text/html")); // inject the new document

    // create a script tag that wraps the bundle
    var bundle_script_tag = iframe.contentWindow.document.createElement("script");
    bundle_script_tag.type = "text/javascript";
    bundle_script_tag.text = this.fsService.readFile("/dist/bundle.js");

    // when Reflect is loaded, inject the bundle into the iframe
    var intervalId = setInterval(function () {
      if (iframe.contentWindow['Reflect']
        && iframe.contentWindow['Reflect'].getOwnMetadata
        && iframe.contentWindow['Zone']) {

        iframe.contentWindow.document.body.appendChild(bundle_script_tag);
        clearInterval(intervalId);
      }
    }, 10);
  }

  compileButtonHandler(event) {
    // let fileContents = this.fsService.readFile("/component.ts");
    this.consoleDrawer.nativeElement.innerText = "Compiling...";
    this.compilerService.compile(this.fsService.getFsBundle())
      .then((compiled_bundle) => {
        this.injectCompiledApp(compiled_bundle);
        this.consoleDrawer.nativeElement.innerText = "Compilation Successful!";
      }).catch((error) => {
        // display the error - replace with injection into an error box
        this.consoleDrawer.nativeElement.innerText = error;
      }
    );
  }
}
