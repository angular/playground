import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';

import {
  MdToolbarModule, MdSidenavModule, MdButtonModule,
  MdGridListModule, MdTabsModule, MdIconModule
} from '@angular/material';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { MonacoEditorComponent } from './monaco-editor/monaco-editor.component';

import { VirtualFsService } from './virtual-fs.service';
import { CompilerService } from './compiler.service';
import { MonacoRawComponent } from './monaco-raw/monaco-raw.component';
import { FileViewerModule } from './file-viewer/file-viewer.module';
import { SharedModule } from './shared/shared.module';

@NgModule({
  declarations: [
    AppComponent,
    MonacoEditorComponent,
    MonacoRawComponent,
  ],
  imports: [
    BrowserModule,
    MdToolbarModule,
    MdButtonModule,
    MdTabsModule,
    BrowserAnimationsModule,
    FileViewerModule,
    SharedModule,
    MdIconModule,
    HttpModule
  ],
  providers: [
    VirtualFsService,
    CompilerService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
