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

  @Input() folderList;

  display: boolean = true;

  constructor(private tabControlService: TabControlService,
    private fsService: VirtualFsService, public dialog: MdDialog,
    private sanitizer: DomSanitizer) {
  }

  generateMarginStyle(level) {
    return this.sanitizer.bypassSecurityTrustStyle(
      `margin-left: calc(10px * ${level})`
    );
  }

  @ViewChild('folderMenu') public folderMenu: ContextMenuComponent;
  @ViewChild('fileMenu') public fileMenu: ContextMenuComponent;

  private fileSelected(file) {
    this.tabControlService.createTab(file.fileName);
  }

  removeFile($event, item) {
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

  removeFolder($event) {
    console.log($event);
    let path = $event.item.object.fullPath;
    console.log(`full folder path: ${path}`);

    for (let filename of this.fsService.getFileList()) {
      console.log(filename);
      if (filename.indexOf(path) == 0) {
        this.fsService.deleteFile(filename);
      }
    }
  }

  objectClickEvent(event, object) {
    if (object.fileName) {
      this.fileSelected(object);
    }
  }

  addNewFileInFolder($event) {
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
  constructor(private dialogRef: MdDialogRef<NewFileDialog>,
              @Inject(MD_DIALOG_DATA) public data: any) {}
}
