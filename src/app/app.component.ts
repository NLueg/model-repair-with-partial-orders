import { Component } from '@angular/core';
import { Subject } from 'rxjs';

import { DownloadService } from './services/download/download.service';
import { NetCommandService } from './services/repair/net-command.service';
import { UploadService } from './services/upload/upload.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  resetPositioningSubject: Subject<void> = new Subject<void>();

  constructor(
    private uploadService: UploadService,
    private downloadService: DownloadService,
    public netCommandService: NetCommandService
  ) {}

  resetSvgPositioning(): void {
    this.resetPositioningSubject.next();
  }

  public openFileSelector(): void {
    this.uploadService.openFileSelector();
  }

  public dropFiles(event: DragEvent): void {
    if (event.dataTransfer?.files) {
      this.uploadService.uploadFiles(event.dataTransfer.files);
    }
  }
}
