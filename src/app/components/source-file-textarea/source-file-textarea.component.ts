import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import {
  debounceTime,
  distinctUntilChanged,
  Observable,
  Subscription,
} from 'rxjs';

import {
  Coordinates,
  CoordinatesInfo,
} from '../../classes/diagram/coordinates';
import { isRunEmpty, PetriNet } from '../../classes/diagram/petriNet';
import { DisplayService } from '../../services/display.service';
import { ParserService } from '../../services/parser/parser.service';
import { offsetAttribute } from '../../services/parser/parsing-constants';
import { exampleContent1 } from '../../services/upload/example-file';
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
  private _offsetSub: Subscription;

  private _resetEventSubscription?: Subscription;

  textareaFc: FormControl;
  isCurrentRunEmpty$: Observable<boolean>;

  @Input()
  resetEvent?: Observable<void>;

  runValidationStatus: Valid | null = null;
  runHint = '';

  constructor(
    private _parserService: ParserService,
    private _displayService: DisplayService,
    private _uploadService: UploadService
  ) {
    this.textareaFc = new FormControl();

    this.isCurrentRunEmpty$ = this._displayService
      .isCurrentRunEmpty$()
      .pipe(distinctUntilChanged());

    this._sub = this.textareaFc.valueChanges
      .pipe(debounceTime(400))
      .subscribe((val) => this.processSourceChange(val));

    this._coordsSub = this._displayService
      .coordsInfoAdded()
      .subscribe((val) => this.addLayerPosInfo(val));

    this._offsetSub = this._displayService
      .offsetInfoAdded()
      .subscribe((val) => this.addOffsetInfo(val));

    this._fileSub = this._uploadService
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
    this.processNewSource(exampleContent1);
  }

  ngOnDestroy(): void {
    this._resetEventSubscription?.unsubscribe();
    this._sub.unsubscribe();
    this._fileSub.unsubscribe();
  }

  private processSourceChange(newSource: string): void {
    const errors = new Set<string>();
    const result = this._parserService.parse(newSource, errors);
    this.updateValidation(result, errors);

    if (!result) return;
    if (result.offset) {
      this._displayService.updateOffsetInfo(result.offset);
    }
    this._displayService.setNewNet(result);
  }

  private processNewSource(newSource: string): void {
    const errors = new Set<string>();
    const result = this._parserService.parse(newSource, errors);
    this.updateValidation(result, errors);

    if (!result) return;
    this._displayService.setNewNet(result);
    this.textareaFc.setValue(newSource);
  }

  private addLayerPosInfo(coordinatesInfo: Array<CoordinatesInfo>): void {
    const newValue = updateCoordsInText(this.textareaFc.value, coordinatesInfo);

    if (newValue) {
      this.textareaFc.setValue(newValue, { emitEvent: false });
      this.processSourceChange(newValue);
    }
  }

  private addOffsetInfo(offset: Coordinates): void {
    let currentValue = this.textareaFc.value;
    if (!currentValue) {
      return;
    }

    if (!currentValue.endsWith('\n')) {
      currentValue += '\n';
    }
    const offsetString = `${offsetAttribute}\n${offset.x} ${offset.y}`;
    const patternString = '\\.offset\\n-?\\d+ -?\\d+';
    const replacePattern = new RegExp(patternString, 'g');
    let newValue = currentValue + offsetString;
    if (replacePattern.test(currentValue)) {
      newValue = currentValue.replace(replacePattern, offsetString);
    }
    this.textareaFc.setValue(newValue, { emitEvent: true });
  }

  public removeCoordinates(): void {
    const newText = removeCoordinates(this.textareaFc.value);
    this.textareaFc.setValue(newText);
    this.processSourceChange(newText);
  }

  public removeOffset(): void {
    const contentLines = this.textareaFc.value.split('\n');
    let isOffsetLine = false;
    let first = true;
    let newText = '';
    for (const line of contentLines) {
      if (line === offsetAttribute) {
        isOffsetLine = true;
        newText += '\n';
      }
      if (!isOffsetLine) {
        if (first) {
          newText = newText + line;
          first = false;
        } else {
          newText = newText + '\n' + line;
        }
      }
    }
    this.textareaFc.setValue(newText);
    this.processSourceChange(newText);
    this._displayService.setOffsetInfo({ x: 0, y: 0 });
  }

  private updateShownRun(run: PetriNet, emitEvent = true): void {
    this.textareaFc.setValue(run.text, { emitEvent: emitEvent });
    this.updateValidation(run);
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
