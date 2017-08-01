import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MdIconModule, MdListModule, MdDialogModule, MdInputModule
} from '@angular/material';
import { FormsModule } from '@angular/forms';

import { ContextMenuModule } from 'ngx-contextmenu';

import { SharedModule } from '../shared/shared.module';

import {FileViewerComponent} from './file-viewer.component';
import {FolderViewComponent, RemoveFileDialog, NewFileDialog} from './folder-view/folder-view.component';
import { ValuesPipe } from './values.pipe';

import {VirtualFsService} from '../virtual-fs.service';


@NgModule({
  imports: [
    CommonModule,
    MdIconModule,
    SharedModule,
    MdListModule,
    FormsModule,
    MdDialogModule,
    ContextMenuModule,
    MdInputModule
  ],
  declarations: [
    FileViewerComponent,
    FolderViewComponent,
    ValuesPipe,
    RemoveFileDialog, NewFileDialog
  ],
  exports: [
    FileViewerComponent
  ],
  providers: [
    VirtualFsService
  ],
  entryComponents: [
    RemoveFileDialog, NewFileDialog
  ]
})
export class FileViewerModule { }
