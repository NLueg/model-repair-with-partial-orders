import { Component, OnInit } from '@angular/core';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';
import { first, map, Observable, Subject } from 'rxjs';

import { DisplayService } from './services/display.service';
import { NetCommandService } from './services/repair/net-command.service';
import {
  andLog,
  andPetriNet,
  coffeeMachineLog,
  coffeeMachineNet,
  loopLog,
  loopPetriNet,
  repairExampleLog,
  repairExampleNet,
  skipLog,
  skipNet,
} from './services/upload/simple-example/evaluation/evaluation';
import {
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
      setTimeout(() => this.resetSvgPositioning());
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

  downloadEvaluationFiles(): void {
    const zip = new JSZip();

    const andFolder = zip.folder('1 - and');
    andFolder?.file('and.log', andLog);
    andFolder?.file('and.pn', andPetriNet);

    const loopFolder = zip.folder('2 - loop');
    loopFolder?.file('loop.log', loopLog);
    loopFolder?.file('loop.pn', loopPetriNet);

    const eventSkipFolder = zip.folder('3 - event-skip');
    eventSkipFolder?.file('event-skip.log', skipLog);
    eventSkipFolder?.file('event-skip.pn', skipNet);

    const repairExample = zip.folder('4 - repair-example');
    repairExample?.file('repair-example.log', repairExampleLog);
    repairExample?.file('repair-example.pn', repairExampleNet);

    const coffeeMachine = zip.folder('5 - coffee-machine');
    coffeeMachine?.file('coffee-machine.log', coffeeMachineLog);
    coffeeMachine?.file('coffee-machine.pn', coffeeMachineNet);

    zip.generateAsync({ type: 'blob' }).then((content) => {
      saveAs(content, 'evaluation.zip');
    });
  }

  ngOnInit(): void {
    this.partialOrderCount$
      .pipe(first())
      .subscribe((count) => this.startEditing(count.count));
  }
}
