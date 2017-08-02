import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';

@Injectable()
export class ErrorHandlerService {

  constructor() { }

  private errorSource = new Subject();
  private specificErrorSource = new Subject();

  public $errorsGenerated = this.errorSource.asObservable();
  public $specificErrorTargeted = this.specificErrorSource.asObservable();

  public setErrors(errors: any) {
    this.errorSource.next(errors);
  }

  public targetSpecificError(specificError) {
    this.specificErrorSource.next(specificError);
  }

}
