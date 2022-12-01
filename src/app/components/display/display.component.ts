import { Component, ElementRef, ViewChild } from '@angular/core';
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
export class DisplayComponent {
  svgElements$: Observable<SVGElement[]>;
  @ViewChild('canvas') canvas: CanvasComponent | undefined;
  @ViewChild('svg_wrapper') svgWrapper: ElementRef<HTMLElement> | undefined;

  constructor(
    private layoutService: LayoutService,
    private svgService: SvgService,
    private displayService: DisplayService
  ) {
    this.svgElements$ = this.displayService.getPetriNet$().pipe(
      map((currentRun) => this.layoutService.layout(currentRun).run),
      map((modifiedRun) => {
        if (this.canvas && this.canvas.drawingArea) {
          const w = this.canvas.drawingArea.nativeElement.clientWidth;
          const h = this.canvas.drawingArea.nativeElement.clientHeight;
          if (w > 0 && h > 0)
            this.layoutService.centerPetriNet(modifiedRun, w / 2, h / 2);
        }
        return this.svgService.createSvgElements(modifiedRun);
      })
    );
  }
}
