import { Injectable, OnDestroy } from '@angular/core';
import { first, Subject } from 'rxjs';

import { PetriNet } from '../../classes/diagram/petri-net';
import { DownloadFormat } from '../../components/download/download.const';
import { DisplayService } from '../display.service';
import { generateTextFromNet } from '../parser/net-to-text.func';
import { convertPetriNetToPnml } from './run-to-pnml/petri-net-to-pnml.service';

@Injectable({
  providedIn: 'root',
})
export class DownloadService implements OnDestroy {
  private _download$: Subject<string>;

  constructor(private displayService: DisplayService) {
    this._download$ = new Subject<string>();
  }

  ngOnDestroy(): void {
    this._download$.complete();
  }

  downloadNet(name: string, fileFormat: DownloadFormat): void {
    this.displayService
      .getPetriNet$()
      .pipe(first())
      .subscribe((run) => {
        const fileEnding = getFileEndingForFormat(fileFormat);
        const fileName = name
          ? `${name}.${fileEnding}`
          : `${Date.now()}_net.${fileEnding}`;

        this.downloadRun(fileName, fileFormat, run);
      });
  }

  private downloadRun(
    name: string,
    fileFormat: DownloadFormat,
    petriNet: PetriNet
  ): void {
    const fileContent =
      fileFormat === 'pn'
        ? generateTextFromNet(petriNet)
        : convertPetriNetToPnml(name, petriNet);

    const downloadLink: HTMLAnchorElement = document.createElement('a');
    downloadLink.download = name;
    downloadLink.href =
      'data:text/plain;charset=utf-16,' + encodeURIComponent(fileContent);
    downloadLink.click();
    downloadLink.remove();
  }
}

function getFileEndingForFormat(fileFormat: DownloadFormat): string {
  return fileFormat === 'pn' ? 'pn' : 'pnml';
}
