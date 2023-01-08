import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

import { DisplayService } from '../display.service';
import { ParserService } from '../parser/parser.service';
import { netTypeKey } from '../parser/parsing-constants';
import { getRunTextFromPnml } from './pnml/pnml-to-run.fn';

export type StructureType = 'petri-net' | 'log';

const allowedExtensions: { [key in StructureType]: string[] } = {
  'petri-net': ['pn', 'pnml'],
  log: ['txt', 'log'],
};

@Injectable({
  providedIn: 'root',
})
export class UploadService {
  private currentUpload$: Subject<string>;

  constructor(
    private toastr: ToastrService,
    private parserService: ParserService,
    private displayService: DisplayService
  ) {
    this.currentUpload$ = new BehaviorSubject<string>('');
  }

  setUploadText(text: string): void {
    this.currentUpload$.next(text);
  }

  getUpload$(): Observable<string> {
    return this.currentUpload$.asObservable();
  }

  openFileSelector(type?: StructureType): void {
    const fileUpload = document.createElement('input');
    fileUpload.setAttribute('type', 'file');
    fileUpload.setAttribute('multiple', 'multiple');

    const relevantExtensions = type
      ? allowedExtensions[type]
      : Object.values(allowedExtensions).flat();

    fileUpload.setAttribute(
      'accept',
      relevantExtensions.map((e) => '.' + e).join(',')
    );
    fileUpload.onchange = (event) => {
      if (event.target instanceof HTMLInputElement && event.target?.files) {
        this.uploadFiles(event.target.files);
      }
    };

    fileUpload.click();
  }

  uploadFiles(files: FileList, type?: StructureType): void {
    const filteredFiles = Array.from(files).filter((file) =>
      fileExtensionIsValid(file.name, type)
    );
    if (filteredFiles.length === 0) {
      this.toastr.error("Couldn't find any valid file");
      return;
    }

    this.toastr.success(
      `Processed ${filteredFiles.length} valid ${
        filteredFiles.length === 1 ? 'file' : 'files'
      }`
    );
    filteredFiles.forEach((file) => {
      const reader = new FileReader();
      const fileExtension = getExtensionForFileName(file.name);

      reader.onload = () => {
        let content: string = reader.result as string;

        if (fileExtension?.toLowerCase() === 'pnml') {
          content = getRunTextFromPnml(content);
        }
        this.processNewSource(content);
      };

      reader.readAsText(file);
    });
  }

  private processNewSource(newSource: string): void {
    const errors = new Set<string>();

    if (newSource.trim().startsWith(netTypeKey)) {
      const petriNet = this.parserService.parsePetriNet(newSource, errors);
      if (!petriNet) return;

      this.displayService.setNewNet(petriNet, errors);
      this.currentUpload$.next(newSource);
    } else {
      const partialOrder = this.parserService.parsePartialOrder(newSource);
      if (!partialOrder) return;

      this.displayService.appendNewPartialOrder(partialOrder);
    }
  }
}

function fileExtensionIsValid(fileName: string, type?: StructureType): boolean {
  const fileExtension = getExtensionForFileName(fileName);
  if (!fileExtension) {
    return false;
  }

  const relevantExtensions = type
    ? allowedExtensions[type]
    : Object.values(allowedExtensions).flat();
  return relevantExtensions.includes(fileExtension.trim());
}

function getExtensionForFileName(fileName: string): string | undefined {
  return fileName.split('.').pop();
}
