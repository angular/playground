import { Component, Input} from '@angular/core';
import { TabControlService } from '../../shared/tab-control.service';

@Component({
  selector: 'app-folder-view',
  templateUrl: './folder-view.component.html',
  styleUrls: ['./folder-view.component.css']
})
export class FolderViewComponent {

  @Input() folder: object;

  constructor(private tabControlService: TabControlService) { }

  fileSelected(event, file) {
    console.log(event);
    console.log(file);

    this.tabControlService.createTab(file.fileName);
  }

}


