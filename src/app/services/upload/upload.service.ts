import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Observable, ReplaySubject, Subject } from 'rxjs';

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
  private currentNetUpload$: Subject<string>;
  private currentLogUpload$: Subject<string>;

  constructor(private toastr: ToastrService) {
    this.currentNetUpload$ = new ReplaySubject<string>(1);
    this.currentLogUpload$ = new ReplaySubject<string>(1);
  }

  setUploadText(text: string): void {
    this.currentNetUpload$.next(text);
  }

  getNetUpload$(): Observable<string> {
    return this.currentNetUpload$.asObservable();
  }

  getLogUpload$(): Observable<string> {
    return this.currentLogUpload$.asObservable();
  }

  openFileSelector(type?: StructureType): void {
    const fileUpload = document.createElement('input');
    fileUpload.setAttribute('type', 'file');

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
    if (filteredFiles.length > 1) {
      this.toastr.warning('Only the first file will be used');
    } else {
      this.toastr.success(`Processed file`);
    }

    const file = filteredFiles[0];
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
  }

  private processNewSource(newSource: string): void {
    if (newSource.trim().startsWith(netTypeKey)) {
      this.currentNetUpload$.next(newSource);
    } else {
      this.currentLogUpload$.next(newSource);
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
