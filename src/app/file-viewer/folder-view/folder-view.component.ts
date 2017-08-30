import { Component, Input, Inject, ViewChild} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ContextMenuComponent } from 'ngx-contextmenu';
import { TabControlService } from '../../shared/tab-control.service';
import { MD_DIALOG_DATA, MdDialog, MdDialogRef } from '@angular/material';
import { VirtualFsService } from '../../virtual-fs.service';

@Component({
  selector: 'app-folder-view',
  templateUrl: './folder-view.component.html',
  styleUrls: ['./folder-view.component.css']
})
export class FolderViewComponent {

  @Input() folderList: any;

  display: boolean = true;

  constructor(private tabControlService: TabControlService,
    private fsService: VirtualFsService, public dialog: MdDialog,
    private sanitizer: DomSanitizer) {
  }

  generateListStyle(ow: any) {
    let string = `padding-left: calc(10px * ${ow.level});`;
    if (ow.object.fileName) {
      string += "cursor: pointer;"
    }
    return this.sanitizer.bypassSecurityTrustStyle(string);
  }

  @ViewChild('folderMenu') public folderMenu: ContextMenuComponent;
  @ViewChild('fileMenu') public fileMenu: ContextMenuComponent;

  private fileSelected(file: any) {
    this.tabControlService.createTab(file.fileName);
  }

  removeFile($event: any) {
    let fileName = $event.item.object.fileName;
    if (this.fsService.fileExists(fileName)) {
      let dialogRef = this.dialog.open(RemoveFileDialog, {
        data: fileName,
      });
      dialogRef.afterClosed().subscribe(result => {
        if (result === "Yes") {
          this.tabControlService.closeTab(fileName);
          this.fsService.deleteFile(fileName);
        }
      })
    }
  }

  removeFolder($event: any) {
    let path = $event.item.object.fullPath;

    for (let filename of this.fsService.getFileList()) {
      if (filename.indexOf(path) == 0) {
        this.fsService.deleteFile(filename);
      }
    }
  }

  objectClickEvent(event: Event, object: any) {
    if (object.fileName) {
      this.fileSelected(object);
    }
  }

  addNewFileInFolder($event: any) {
    let dialogRef = this.dialog.open(NewFileDialog, {
      data: {
        "baseName": $event.item.object.fullPath + "/"
      }
    });
    dialogRef.afterClosed().subscribe((result: string) => {
      this.fsService.writeFile(result, "");
    })
  }
}

@Component({
  selector: 'remove-file-dialog',
  template: `
    <h1>Remove File</h1>
    <div md-dialog-content>Are you sure you want to remove {{data}}?</div>
    <div md-dialog-actions>
      <button md-button md-dialog-close="Yes">Yes</button>
      <button md-button md-dialog-close="No">No</button>
    </div>
  `
})
export class RemoveFileDialog {
  constructor(public dialogRef: MdDialogRef<RemoveFileDialog>,
              @Inject(MD_DIALOG_DATA) public data: any) {}
}

@Component({
  selector: 'newfile-dialog',
  template: `
    <md-input-container>
      <input mdInput value="{{data.baseName}}" #fileName>
    </md-input-container>

    <button type="button" (click)="dialogRef.close(fileName.value)">
      Create File
    </button>
  `
})
export class NewFileDialog {
  constructor(public dialogRef: MdDialogRef<NewFileDialog>,
              @Inject(MD_DIALOG_DATA) public data: any) {}
}
