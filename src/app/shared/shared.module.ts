import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';

import {ErrorHandlerService} from './error-handler.service';
import {ExtractFilenamePipe} from './extract-filename.pipe';
import {TabControlService} from './tab-control.service';

@NgModule({
  imports : [
    CommonModule,
  ],
  declarations : [
    ExtractFilenamePipe,
  ],
  providers : [ TabControlService, ErrorHandlerService ],
  exports : [
    ExtractFilenamePipe,
  ]
})
export class SharedModule {}
