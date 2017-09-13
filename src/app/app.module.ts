import {HttpClientModule} from '@angular/common/http';
import {NgModule} from '@angular/core';
import {HttpModule} from '@angular/http';
import {
  MdButtonModule,
  MdCardModule,
  MdGridListModule,
  MdIconModule,
  MdListModule,
  MdSidenavModule,
  MdTabsModule,
  MdToolbarModule,
  MdProgressSpinnerModule
} from '@angular/material';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

import {AppComponent} from './app.component';
import {CompilerService} from './compiler.service';
import {
  ErrorConsoleComponent,
  ErrorDisplayComponent
} from './error-console/error-console.component';
import {FileViewerModule} from './file-viewer/file-viewer.module';
import {MonacoEditorComponent} from './monaco-editor/monaco-editor.component';
import {MonacoRawComponent} from './monaco-raw/monaco-raw.component';
import {SharedModule} from './shared/shared.module';
import {UpdateIframeDirective} from './update-iframe.directive';
import {VirtualFsService} from './virtual-fs.service';

@NgModule({
  declarations : [
    AppComponent, MonacoEditorComponent, MonacoRawComponent,
    UpdateIframeDirective, ErrorConsoleComponent, ErrorDisplayComponent
  ],
  imports : [
    BrowserModule, MdToolbarModule, MdButtonModule, MdTabsModule,
    BrowserAnimationsModule, FileViewerModule, SharedModule,
    MdIconModule, HttpClientModule, HttpModule, MdListModule, MdCardModule,
    MdProgressSpinnerModule
  ],
  providers : [
    VirtualFsService,
    CompilerService,
  ],
  bootstrap : [ AppComponent ]
})
export class AppModule {}
