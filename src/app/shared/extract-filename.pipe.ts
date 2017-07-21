import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'extractFilename'
})
export class ExtractFilenamePipe implements PipeTransform {

  transform(rawFilename: any, args?: any): any {
    let splitFilename = rawFilename.split("/").filter((part) => part !== "");
    return splitFilename[splitFilename.length - 1];
  }

}
