import { Injectable, OnDestroy } from '@angular/core';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';
import { first, Subject } from 'rxjs';

import { Run } from '../../classes/diagram/run';
import { DisplayService } from '../display.service';
import { RunToPnmlService } from './run-to-pnml/run-to-pnml.service';

@Injectable({
  providedIn: 'root',
})
export class DownloadService implements OnDestroy {
  private _download$: Subject<string>;

  constructor(
    private _displayService: DisplayService,
    private _runToPnmlService: RunToPnmlService
  ) {
    this._download$ = new Subject<string>();
  }

  ngOnDestroy(): void {
    this._download$.complete();
  }

  downloadNet(
    name: string
  ): void {
    this._displayService.currentRun$.pipe(first()).subscribe((run) => {
      const fileEnding = getFileEndingForFormat();
      const fileName = name
        ? `${name}.${fileEnding}`
        : `${Date.now()}_run.${fileEnding}`;

      this.downloadRun(fileName, run);
    });
  }

  private downloadRun(
    name: string,
    run: Run
  ): void {
    // TODO: Just download text
    const fileContent = this._runToPnmlService.parseRunToPnml(name, run);

    const downloadLink: HTMLAnchorElement = document.createElement('a');
    downloadLink.download = name;
    downloadLink.href =
      'data:text/plain;charset=utf-16,' + encodeURIComponent(fileContent);
    downloadLink.click();
    downloadLink.remove();
  }
}

// TODO: Maybe support *.pnml and *.pn
function getFileEndingForFormat(): string {
  return 'pn';
}
