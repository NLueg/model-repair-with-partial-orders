import { Component, OnInit } from '@angular/core';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';
import { first, map, Observable, Subject } from 'rxjs';

import { DisplayService } from './services/display.service';
import { NetCommandService } from './services/repair/net-command.service';
import {
  colloquiumLog,
  colloquiumNet,
  simpleExampleLog,
  simpleExamplePetriNet,
} from './services/upload/simple-example/simple-example-texts';
import { StructureType, UploadService } from './services/upload/upload.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  hasPartialOrders = false;
  isCurrentNetEmpty$: Observable<boolean>;
  partialOrderCount$: Observable<{ count: number }>;
  resetPositioningSubject: Subject<void> = new Subject<void>();

  constructor(
    displayService: DisplayService,
    private uploadService: UploadService,
    public netCommandService: NetCommandService
  ) {
    this.partialOrderCount$ = displayService
      .getPartialOrders$()
      .pipe(map((pos) => ({ count: pos?.length ?? 0 })));

    this.isCurrentNetEmpty$ = displayService.isCurrentNetEmpty$();
  }

  resetSvgPositioning(): void {
    this.resetPositioningSubject.next();
  }

  openFileSelector(type: StructureType | undefined): void {
    this.uploadService.openFileSelector(type);
  }

  dropFiles(event: DragEvent, type: StructureType | undefined): void {
    if (event.dataTransfer?.files) {
      this.uploadService.uploadFiles(event.dataTransfer.files, type);
    }
  }

  startEditing(count: number): void {
    if (count > 0) {
      this.hasPartialOrders = true;
      this.resetSvgPositioning();
    }
  }

  downloadExample(): void {
    const zip = new JSZip();
    zip.file('simple-example-net.pn', simpleExamplePetriNet);
    zip.file('simple-example-log.log', simpleExampleLog);
    zip.generateAsync({ type: 'blob' }).then((content) => {
      saveAs(content, 'simple-example.zip');
    });
  }

  downloadColloquiumExample(): void {
    const zip = new JSZip();
    zip.file('colloquium-net.pn', colloquiumNet);
    zip.file('colloquium-log.log', colloquiumLog);
    zip.generateAsync({ type: 'blob' }).then((content) => {
      saveAs(content, 'colloquium-example.zip');
    });
  }

  ngOnInit(): void {
    this.partialOrderCount$
      .pipe(first())
      .subscribe((count) => this.startEditing(count.count));
  }
}
