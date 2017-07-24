import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MdIconModule, MdListModule } from '@angular/material';

import { SharedModule } from '../shared/shared.module';

import {FileViewerComponent} from './file-viewer.component';
import {FolderViewComponent} from './folder-view/folder-view.component';
import { ValuesPipe } from './values.pipe';



@NgModule({
  imports: [
    CommonModule,
    MdIconModule,
    SharedModule,
    MdListModule,
  ],
  declarations: [
    FileViewerComponent,
    FolderViewComponent,
    ValuesPipe,
  ],
  exports: [FileViewerComponent]
})
export class FileViewerModule { }
