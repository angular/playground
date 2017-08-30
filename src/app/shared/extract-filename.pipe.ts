import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'extractFilename'
})
export class ExtractFilenamePipe implements PipeTransform {

  transform(rawFilename: any, args?: any): any {
    const splitFilename = rawFilename.split('/').filter((part: string) => part !== '');
    return splitFilename[splitFilename.length - 1];
  }

}
