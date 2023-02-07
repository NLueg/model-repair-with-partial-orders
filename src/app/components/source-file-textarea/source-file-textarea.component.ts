import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import {
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  Observable,
  Subscription,
} from 'rxjs';

import { PartialOrder } from '../../classes/diagram/partial-order';
import { isNetEmpty, PetriNet } from '../../classes/diagram/petri-net';
import { DisplayService } from '../../services/display.service';
import { ParserService } from '../../services/parser/parser.service';
import { UploadService } from '../../services/upload/upload.service';
import { xesExpectedResult } from '../../services/upload/xes/xes-.example';

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

  petriNetTextarea: FormControl<string | null>;
  logTextarea: FormControl<string | null>;

  isCurrentNetEmpty$: Observable<boolean>;

  netValidationStatus: Valid | null = null;
  logValidationStatus: Valid | null = null;
  netHint = '';
  logHint = '';

  constructor(
    private parserService: ParserService,
    private displayService: DisplayService,
    private uploadService: UploadService
  ) {
    this.logTextarea = new FormControl<string | null>(null);
    this.petriNetTextarea = new FormControl<string>(emptyContent);

    this.isCurrentNetEmpty$ = this.displayService
      .isCurrentNetEmpty$()
      .pipe(distinctUntilChanged());

    this._sub = this.petriNetTextarea.valueChanges
      .pipe(debounceTime(400))
      .subscribe((val) => this.processSourceChange(val, 'net'));

    this.logTextarea.valueChanges
      .pipe(debounceTime(400))
      .subscribe((val) => this.processSourceChange(val, 'po'));

    this._fileSub = this.uploadService
      .getNetUpload$()
      .subscribe((content) => this.petriNetTextarea.setValue(content));

    this._fileSub = this.uploadService
      .getLogUpload$()
      .subscribe((content) => this.logTextarea.setValue(content));

    combineLatest([
      this.displayService.getPetriNet$(),
      this.displayService.getCurrentErrors$(),
    ]).subscribe(([petriNet, errors]) => {
      this.updateValidationForNet(petriNet, errors);
    });
  }

  ngOnInit(): void {
    this.logTextarea.setValue(xesExpectedResult);

    this.petriNetTextarea.setValue(`.type pn
.transitions
Register Register
Analyze_Defect Analyze_Defect
Inform_User Inform_User
Repair_(Complex) Repair_(Complex)
Test_Repair Test_Repair
Archive_Repair Archive_Repair
Repair_(Simple) Repair_(Simple)
Restart_Repair Restart_Repair
.places
p0 0
p1 1
p2 0
p3 0
p4 0
p5 0
p6 0
p7 0
.arcs
Archive_Repair p0
p1 Register
Register p2
p2 Analyze_Defect
Analyze_Defect p3
p3 Repair_(Complex)
p3 Repair_(Simple)
Restart_Repair p3
Test_Repair p4
p4 Archive_Repair
p4 Restart_Repair
Repair_(Complex) p5
p5 Test_Repair
Repair_(Simple) p5
Inform_User p6
p6 Archive_Repair
Analyze_Defect p7
p7 Inform_User
`);
  }

  ngOnDestroy(): void {
    this._resetEventSubscription?.unsubscribe();
    this._sub.unsubscribe();
    this._fileSub.unsubscribe();
  }

  private processSourceChange(
    newSource: string | null,
    type: 'net' | 'po'
  ): void {
    if (newSource === null || newSource === emptyContent) {
      return;
    }

    if (type === 'net') {
      const errors = new Set<string>();
      const result = this.parserService.parsePetriNet(newSource, errors);

      this.updateValidationForNet(result, errors);
      if (!result) return;

      this.displayService.setNewNet(result, errors);
    } else {
      const errors = new Set<string>();
      const result = this.parserService.parsePartialOrders(newSource, errors);

      this.updateValidationForLog(result, errors);
      if (!result) return;

      this.displayService.setPartialOrders(result);
    }
  }

  private updateValidationForNet(
    run: PetriNet | null,
    errors: Set<string> = new Set<string>()
  ): void {
    this.netHint = [...errors].join('\n');

    if (!run || errors.size > 0) {
      this.petriNetTextarea.setErrors({ 'invalid net': true });
      this.netValidationStatus = 'error';
    } else if (!isNetEmpty(run)) {
      this.netValidationStatus = 'success';
    } else {
      this.netValidationStatus = null;
    }
  }

  private updateValidationForLog(
    orders: PartialOrder[],
    errors: Set<string> = new Set<string>()
  ): void {
    this.logHint = [...errors].join('\n');

    if (orders.length === 0 || errors.size > 0) {
      this.logTextarea.setErrors({ 'invalid log': true });
      this.logValidationStatus = 'error';
    } else if (orders.length > 0) {
      this.logValidationStatus = 'success';
    } else {
      this.logValidationStatus = null;
    }
  }
}
