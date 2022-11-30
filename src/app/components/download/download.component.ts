import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { DownloadPopoverComponent } from './download-popover/download-popover.component';

@Component({
  selector: 'app-download',
  templateUrl: './download.component.html',
  styleUrls: ['./download.component.scss'],
})
export class DownloadComponent {
  constructor(public dialog: MatDialog) {}

  openDialog(): void {
    this.dialog.open(DownloadPopoverComponent);
  }
}
