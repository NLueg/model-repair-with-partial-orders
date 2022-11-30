import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { map, Observable } from 'rxjs';

import { DisplayService } from '../../services/display.service';
import { LayoutService } from '../../services/layout.service';
import { SvgService } from '../../services/svg/svg.service';
import { CanvasComponent } from '../canvas/canvas.component';

@Component({
  selector: 'app-display',
  templateUrl: './display.component.html',
  styleUrls: ['./display.component.scss'],
})
export class DisplayComponent implements AfterViewInit {
  svgElements$: Observable<SVGElement[]>;
  @ViewChild('canvas') canvas: CanvasComponent | undefined;
  @ViewChild('svg_wrapper') svgWrapper: ElementRef<HTMLElement> | undefined;

  ngAfterViewInit(): void {
    const observer = new ResizeObserver((entries) => {
      entries.forEach(() => {
        this.update();
      });
    });
    if (this.svgWrapper) observer.observe(this.svgWrapper.nativeElement);
  }

  constructor(
    private _layoutService: LayoutService,
    private _svgService: SvgService,
    private _displayService: DisplayService
  ) {
    this.svgElements$ = this._displayService.currentRun$.pipe(
      map((currentRun) => this._layoutService.layout(currentRun).run),
      map((modifiedRun) => {
        if (
          this.canvas &&
          this.canvas.drawingArea &&
          (!modifiedRun.offset ||
            (!modifiedRun.offset.x && !modifiedRun.offset.y))
        ) {
          const w = this.canvas.drawingArea.nativeElement.clientWidth;
          const h = this.canvas.drawingArea.nativeElement.clientHeight;
          if (w > 0 && h > 0)
            this._layoutService.centerRuns([modifiedRun], w / 2, h / 2);
        }
        return this._svgService.createSvgElements(modifiedRun, false);
      })
    );
  }

  private update(): void {
    this._displayService.updateCurrentRun(this._displayService.currentRun);
  }
}
