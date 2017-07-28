import { Component, Input, Inject} from '@angular/core';
import { TabControlService } from '../../shared/tab-control.service';
import { MD_DIALOG_DATA, MdDialog, MdDialogRef } from '@angular/material';
import { VirtualFsService } from '../../virtual-fs.service';

@Component({
  selector: 'app-folder-view',
  templateUrl: './folder-view.component.html',
  styleUrls: ['./folder-view.component.css']
})
export class FolderViewComponent {

  @Input() folder: object;

  display: boolean = true;

  constructor(private tabControlService: TabControlService,
    private fsService: VirtualFsService, public dialog: MdDialog) {
  }

  fileSelected(event, file) {
    this.tabControlService.createTab(file.fileName);
  }

  toggleDisplay() {
    this.display = !this.display;
  }

  removeFile(event, fileName) {
    console.log(fileName);
    console.log(this.fsService.fileExists(fileName));
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
