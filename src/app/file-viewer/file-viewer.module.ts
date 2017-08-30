import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {
  MdDialogModule,
  MdIconModule,
  MdInputModule,
  MdListModule
} from '@angular/material';
import {ContextMenuModule} from 'ngx-contextmenu';

import {SharedModule} from '../shared/shared.module';
import {VirtualFsService} from '../virtual-fs.service';

import {FileViewerComponent} from './file-viewer.component';
import {
  FolderViewComponent,
  NewFileDialogComponent,
  RemoveFileDialogComponent
} from './folder-view/folder-view.component';
import {ValuesPipe} from './values.pipe';

@NgModule({
  imports : [
    CommonModule, MdIconModule, SharedModule, MdListModule, FormsModule,
    MdDialogModule, ContextMenuModule, MdInputModule
  ],
  declarations : [
    FileViewerComponent, FolderViewComponent, ValuesPipe,
    RemoveFileDialogComponent, NewFileDialogComponent
  ],
  exports : [ FileViewerComponent ],
  providers : [ VirtualFsService ],
  entryComponents : [ RemoveFileDialogComponent, NewFileDialogComponent ]
})
export class FileViewerModule {}
