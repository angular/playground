import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ExtractFilenamePipe } from './extract-filename.pipe';
import { TabControlService } from './tab-control.service';

@NgModule({
  imports: [
    CommonModule,
  ],
  declarations: [
    ExtractFilenamePipe,
  ],
  providers: [
    TabControlService
  ],
  exports: [
    ExtractFilenamePipe,
  ]
})
export class SharedModule { }
