import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { DownloadService } from '../../../services/download/download.service';

@Component({
  selector: 'app-download-popover',
  templateUrl: './download-popover.component.html',
  styleUrls: ['./download-popover.component.scss'],
})
export class DownloadPopoverComponent {
  downloadName = '';
  compression = false;

  constructor(
    private dialogRef: MatDialogRef<DownloadPopoverComponent>,
    private _downloadService: DownloadService
  ) {}

  download(): void {
    this._downloadService.downloadNet(
      this.downloadName
    );
    this.closePopover();
  }

  closePopover(): void {
    this.dialogRef.close();
  }
}
