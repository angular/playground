import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MdIconModule, MdListModule, MdDialogModule } from '@angular/material';
import { FormsModule } from '@angular/forms';

import { SharedModule } from '../shared/shared.module';

import {FileViewerComponent} from './file-viewer.component';
import {FolderViewComponent, RemoveFileDialog} from './folder-view/folder-view.component';
import { ValuesPipe } from './values.pipe';

import {VirtualFsService} from '../virtual-fs.service';


@NgModule({
  imports: [
    CommonModule,
    MdIconModule,
    SharedModule,
    MdListModule,
    FormsModule,
    MdDialogModule
  ],
  declarations: [
    FileViewerComponent,
    FolderViewComponent,
    ValuesPipe,
    RemoveFileDialog
  ],
  exports: [
    FileViewerComponent
  ],
  providers: [
    VirtualFsService
  ],
  entryComponents: [
    RemoveFileDialog
  ]
})
export class FileViewerModule { }
