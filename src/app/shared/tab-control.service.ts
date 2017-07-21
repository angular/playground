import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';

@Injectable()
export class TabControlService {

  // Observable sources
  private tabCreatedSource = new Subject<string>();
  private tabClosedSource = new Subject<string>();

  // Observable streams
  tabCreated$ = this.tabCreatedSource.asObservable();
  tabClosed$ = this.tabClosedSource.asObservable();

  // Message commands
  createTab(filename: string) {
    this.tabCreatedSource.next(filename);
  }

  closeTab(filename: string) {
    this.tabClosedSource.next(filename);
  }

}
