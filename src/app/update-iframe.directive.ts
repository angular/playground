import { Directive, ElementRef, Input, OnChanges, SimpleChanges } from '@angular/core';
import { VirtualFsService } from './virtual-fs.service';
import { Http } from '@angular/http';

@Directive({
  selector: '[appUpdateIframe]'
})
export class UpdateIframeDirective implements OnChanges{

  @Input('appUpdateIframe') generatedBundle;

  constructor(private iframeContainer: ElementRef,
              private fsService: VirtualFsService, private http:Http) { }

  private updateIFrame(generatedBundle) {
    const files: string[] = Object.keys(generatedBundle.fileSystem);

    for (let filename of files) {
      this.fsService.writeFile(filename, generatedBundle.fileSystem[filename].text);
    }

    const html = this.fsService.readFile("index.html");

    const parser = new DOMParser();

    // delete old iframe and insert the new iframe
    const container = this.iframeContainer.nativeElement;
    while (container.hasChildNodes()) {
      container.removeChild(container.lastChild);
    }
    const iframe = document.createElement("iframe");
    container.appendChild(iframe);

    var doc = iframe.contentWindow.document;
    doc.open();
    doc.write(html);
    doc.close();

    // load the deps and inject the bundle
    const shimurl = 'https://unpkg.com/core-js@2.4.1/client/shim.min.js';
    const zoneurl = 'https://unpkg.com/zone.js/dist/zone.js';

    Promise.all([this.http.get(shimurl).toPromise(), this.http.get(zoneurl).toPromise()])
      .then(fetchedDependencies => {

        const bundle_script = fetchedDependencies.reduce((bundle, dep) => bundle + "\n" + dep.text(),
          "") + this.fsService.readFile("/dist/bundle.js");

        const bundle_script_tag = iframe.contentWindow.document.createElement("script");
        bundle_script_tag.type = "text/javascript";
        bundle_script_tag.text = bundle_script;

        iframe.contentWindow.document.body.appendChild(bundle_script_tag);
      });
  }

  ngOnChanges(changes: SimpleChanges) {
    for (let propName in changes) {
      let chng = changes[propName];

      if (propName === "generatedBundle" && chng.currentValue) {
        this.updateIFrame(chng.currentValue);
      }
    }
  }

}
