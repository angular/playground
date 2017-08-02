import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';

import {
  MdToolbarModule, MdSidenavModule, MdButtonModule,
  MdGridListModule, MdTabsModule, MdIconModule,
  MdSnackBarModule, MdListModule
} from '@angular/material';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { MonacoEditorComponent } from './monaco-editor/monaco-editor.component';

import { VirtualFsService } from './virtual-fs.service';
import { CompilerService } from './compiler.service';
import { MonacoRawComponent } from './monaco-raw/monaco-raw.component';
import { FileViewerModule } from './file-viewer/file-viewer.module';
import { SharedModule } from './shared/shared.module';
import { UpdateIframeDirective } from './update-iframe.directive';
import { ErrorConsoleComponent } from './error-console/error-console.component';

@NgModule({
  declarations: [
    AppComponent,
    MonacoEditorComponent,
    MonacoRawComponent,
    UpdateIframeDirective,
    ErrorConsoleComponent,
  ],
  imports: [
    BrowserModule,
    MdToolbarModule,
    MdButtonModule,
    MdTabsModule,
    MdSnackBarModule,
    BrowserAnimationsModule,
    FileViewerModule,
    SharedModule,
    MdIconModule,
    HttpClientModule,
    HttpModule,
    MdListModule,
  ],
  providers: [
    VirtualFsService,
    CompilerService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
