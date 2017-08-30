import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'values'})
export class ValuesPipe implements PipeTransform {
  transform(value: any, args?: any[]): any[] {
    let keyArr: any[] = Object.keys(value);
    let dataArr: any[] = [];

    keyArr.forEach((key: any) => {
      dataArr.push(value[key]);
    });

    return dataArr;
  }
}
