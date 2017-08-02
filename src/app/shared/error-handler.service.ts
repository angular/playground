import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';

@Injectable()
export class ErrorHandlerService {

  constructor() { }

  private errorSource = new Subject();

  public $errorsGenerated = this.errorSource.asObservable();

  public setErrors(errors: any) {
    this.errorSource.next(errors);
  }

}
