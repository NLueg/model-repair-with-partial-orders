import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import {
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  first,
  Observable,
  Subscription,
} from 'rxjs';

import { isNetEmpty, PetriNet } from '../../classes/diagram/petri-net';
import { DisplayService } from '../../services/display.service';
import { ParserService } from '../../services/parser/parser.service';
import { UploadService } from '../../services/upload/upload.service';

type Valid = 'error' | 'warn' | 'success';

const emptyContent =
  '.type pn\n' + '.transitions\n\n' + '.places\n\n' + '.arcs\n';

@Component({
  selector: 'app-source-file-textarea',
  templateUrl: './source-file-textarea.component.html',
  styleUrls: ['./source-file-textarea.component.scss'],
})
export class SourceFileTextareaComponent implements OnDestroy, OnInit {
  @Input() events: Observable<void> | undefined;
  private _sub: Subscription;
  private _fileSub: Subscription;

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

    this._fileSub = this.uploadService
      .getUpload$()
      .subscribe((content) => this.textareaFc.setValue(content));

    combineLatest([
      this.displayService.getPetriNet$(),
      this.displayService.getCurrentErrors$(),
    ]).subscribe(([petriNet, errors]) => {
      this.updateValidation(petriNet, errors);
    });
  }

  ngOnInit(): void {
    this._resetEventSubscription = this.resetEvent?.subscribe(() =>
      this.processSourceChange(this.textareaFc.value)
    );

    this.uploadService
      .getUpload$()
      .pipe(first())
      .subscribe((content) => {
        this.textareaFc.setValue(
          content ||
            '.type pn\n' +
              '.transitions\n' +
              't1 t1\n' +
              't2\n' +
              't3 t3\n' +
              't4\n' +
              't5\n' +
              't6 t6\n' +
              '.places\n' +
              'p1 1\n' +
              'p2 0\n' +
              'p3 0\n' +
              'p4 0\n' +
              'p5 0\n' +
              '.arcs\n' +
              'p1 t1\n' +
              't1 p2\n' +
              't1 p3\n' +
              'p2 t2\n' +
              't2 p4\n' +
              'p4 t3\n' +
              't3 p3\n' +
              'p3 t4\n' +
              't4 p5\n' +
              'p4 t5\n' +
              't5 p3\n' +
              'p5 t6\n' +
              't6 p3'
        );
      });
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

    this.displayService.setNewNet(result, errors);
  }

  private updateValidation(
    run: PetriNet | null,
    errors: Set<string> = new Set<string>()
  ): void {
    this.runHint = [...errors].join('\n');

    if (!run || errors.size > 0) {
      this.textareaFc.setErrors({ 'invalid run': true });
      this.runValidationStatus = 'error';
    } else if (!isNetEmpty(run)) {
      this.runValidationStatus = 'success';
    } else {
      this.runValidationStatus = null;
    }
  }
}
