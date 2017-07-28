import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MdIconModule, MdListModule } from '@angular/material';
import { FormsModule } from '@angular/forms';

import { SharedModule } from '../shared/shared.module';

import {FileViewerComponent} from './file-viewer.component';
import {FolderViewComponent} from './folder-view/folder-view.component';
import { ValuesPipe } from './values.pipe';

import {VirtualFsService} from '../virtual-fs.service';


@NgModule({
  imports: [
    CommonModule,
    MdIconModule,
    SharedModule,
    MdListModule,
    FormsModule
  ],
  declarations: [
    FileViewerComponent,
    FolderViewComponent,
    ValuesPipe,
  ],
  exports: [
    FileViewerComponent
  ],
  providers: [
    VirtualFsService
  ],
})
export class FileViewerModule { }
