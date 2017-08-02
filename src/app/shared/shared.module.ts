import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ExtractFilenamePipe } from './extract-filename.pipe';
import { TabControlService } from './tab-control.service';
import { ErrorHandlerService } from './error-handler.service';

@NgModule({
  imports: [
    CommonModule,
  ],
  declarations: [
    ExtractFilenamePipe,
  ],
  providers: [
    TabControlService,
    ErrorHandlerService
  ],
  exports: [
    ExtractFilenamePipe,
  ]
})
export class SharedModule { }
