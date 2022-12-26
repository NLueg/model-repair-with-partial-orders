import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import {
  debounceTime,
  distinctUntilChanged,
  Observable,
  Subscription,
} from 'rxjs';

import { CoordinatesInfo } from '../../classes/diagram/coordinates';
import { isRunEmpty, PetriNet } from '../../classes/diagram/petri-net';
import { DisplayService } from '../../services/display.service';
import { ParserService } from '../../services/parser/parser.service';
import { netTypeKey } from '../../services/parser/parsing-constants';
import { simpleExamplePetriNet } from '../../services/upload/simple-example/simple-example-texts';
import { UploadService } from '../../services/upload/upload.service';
import {
  removeCoordinates,
  updateCoordsInText,
} from './update-coords-in-text.fn';

type Valid = 'error' | 'warn' | 'success';

@Component({
  selector: 'app-source-file-textarea',
  templateUrl: './source-file-textarea.component.html',
  styleUrls: ['./source-file-textarea.component.scss'],
})
export class SourceFileTextareaComponent implements OnDestroy, OnInit {
  @Input() events: Observable<void> | undefined;
  private _sub: Subscription;
  private _fileSub: Subscription;
  private _coordsSub: Subscription;

  private _resetEventSubscription?: Subscription;

  textareaFc: FormControl;
  isCurrentRunEmpty$: Observable<boolean>;

  @Input()
  resetEvent?: Observable<void>;

  runValidationStatus: Valid | null = null;
  runHint = '';

  constructor(
    private parserService: ParserService,
    private displayService: DisplayService,
    private uploadService: UploadService
  ) {
    this.textareaFc = new FormControl();

    this.isCurrentRunEmpty$ = this.displayService
      .isCurrentRunEmpty$()
      .pipe(distinctUntilChanged());

    this._sub = this.textareaFc.valueChanges
      .pipe(debounceTime(400))
      .subscribe((val) => this.processSourceChange(val));

    this._coordsSub = this.displayService
      .coordsInfoAdded()
      .subscribe((val) => this.addLayerPosInfo(val));

    this._fileSub = this.uploadService
      .getUpload$()
      .subscribe((content) => this.processNewSource(content));
  }

  ngOnInit(): void {
    this._resetEventSubscription = this.resetEvent?.subscribe(() =>
      this.removeCoordinates()
    );
    this._resetEventSubscription = this.resetEvent?.subscribe(() =>
      this.removeOffset()
    );
    this.processNewSource(simpleExamplePetriNet);
  }

  ngOnDestroy(): void {
    this._resetEventSubscription?.unsubscribe();
    this._sub.unsubscribe();
    this._fileSub.unsubscribe();
  }

  private processSourceChange(newSource: string): void {
    const errors = new Set<string>();
    const result = this.parserService.parsePetriNet(newSource, errors);
    this.updateValidation(result, errors);

    if (!result) return;
    this.displayService.setNewNet(result);
  }

  private processNewSource(newSource: string): void {
    const errors = new Set<string>();

    if (newSource.trim().startsWith(netTypeKey)) {
      const petriNet = this.parserService.parsePetriNet(newSource, errors);
      this.updateValidation(petriNet, errors);
      if (!petriNet) return;

      this.displayService.setNewNet(petriNet);
      this.textareaFc.setValue(newSource);
    } else {
      const partialOrder = this.parserService.parsePartialOrder(
        newSource,
        errors
      );
      if (!partialOrder) return;

      this.displayService.appendNewPartialOrder(partialOrder);
    }
  }

  private addLayerPosInfo(coordinatesInfo: Array<CoordinatesInfo>): void {
    const newValue = updateCoordsInText(this.textareaFc.value, coordinatesInfo);

    if (newValue) {
      this.textareaFc.setValue(newValue, { emitEvent: false });
      this.processSourceChange(newValue);
    }
  }

  public removeCoordinates(): void {
    const newText = removeCoordinates(this.textareaFc.value);
    this.textareaFc.setValue(newText);
    this.processSourceChange(newText);
  }

  public removeOffset(): void {
    const contentLines = this.textareaFc.value.split('\n');
    let first = true;
    let newText = '';
    for (const line of contentLines) {
      if (first) {
        newText = newText + line;
        first = false;
      } else {
        newText = newText + '\n' + line;
      }
    }
    this.textareaFc.setValue(newText);
    this.processSourceChange(newText);
  }

  private updateValidation(
    run: PetriNet | null,
    errors: Set<string> = new Set<string>()
  ): void {
    this.runHint = [...errors].join('\n');

    if (!run || errors.size > 0) {
      this.textareaFc.setErrors({ 'invalid run': true });
      this.runValidationStatus = 'error';
    } else if (!isRunEmpty(run)) {
      this.runValidationStatus = 'success';
    } else {
      this.runValidationStatus = null;
    }
  }
}
