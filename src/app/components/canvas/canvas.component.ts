import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { Draggable } from 'src/app/classes/diagram/draggable';

import { CoordinatesInfo } from '../../classes/diagram/coordinates';
import { DisplayService } from '../../services/display.service';
import { asInt, getYAttribute } from '../../services/moving/dragging-helper.fn';
import { DraggingCreationService } from '../../services/moving/factory/draggable-creation.service';
import { FindElementsService } from '../../services/moving/find/find-elements.service';
import { MoveElementsService } from '../../services/moving/move/move-elements.service';
import { StatehandlerService } from '../../services/moving/statehandler/statehandler.service';
import { SvgService } from '../../services/svg/svg.service';
import {
  breakpointPositionAttribute,
  breakpointTrail,
  fromTransitionAttribute,
  idAttribute,
  layerPosYAttibute,
  originalYAttribute,
  toTransitionAttribute,
} from '../../services/svg/svg-constants';

@Component({
  selector: 'app-canvas',
  templateUrl: './canvas.component.html',
  styleUrls: ['./canvas.component.scss'],
})
export class CanvasComponent implements OnInit, OnDestroy {
  @ViewChild('drawingArea') drawingArea: ElementRef<SVGElement> | undefined;

  @Input()
  svgElements$?: Observable<SVGElement[]>;

  @Input()
  canvasHeight = 400;

  @Output()
  coordinateChanged = new EventEmitter<CoordinatesInfo[]>();

  private _sub: Subscription | undefined;

  constructor(
    private svgService: SvgService,
    private displayService: DisplayService,
    private stateHandler: StatehandlerService
  ) {}

  ngOnDestroy(): void {
    this._sub?.unsubscribe();
  }

  ngOnInit(): void {
    this.svgElements$?.subscribe((elements) => {
      if (!this.drawingArea) {
        return;
      }

      this.clearDrawingArea();
      for (const element of elements) {
        this.drawingArea.nativeElement.appendChild(element);
      }
      this.registerCanvasMouseHandler(this.drawingArea.nativeElement);
      this.registerSingleMouseHandler(this.drawingArea.nativeElement);
    });
  }

  private clearDrawingArea() {
    const drawingArea = this.drawingArea?.nativeElement;
    if (drawingArea?.childElementCount === undefined) {
      return;
    }

    while (drawingArea.childElementCount > 1 /* keep arrowhead marker */) {
      drawingArea.removeChild(drawingArea.lastChild as ChildNode);
    }

    drawingArea.style.height = `${this.canvasHeight}px`;
  }

  private registerCanvasMouseHandler(drawingArea: SVGElement) {
    drawingArea.onmousedown = (e) => {
      this.stateHandler.initMouseDownForRun(e);
    };

    drawingArea.onmousemove = (e) => {
      if (this.stateHandler.childIsBeingDragged()) {
        this.moveChildElementIfExisting();
        this.stateHandler.updateChangeStateDraggable(e);
      }
      if (this.stateHandler.runIsMoving()) {
        this.stateHandler.updateChangeStateRun(e);
        MoveElementsService.moveRun(
          drawingArea,
          this.stateHandler.getLocalChangesForRun()
        );
      }
    };
    drawingArea.onmouseup = () => {
      this.stateHandler.resetCanvasHandlers();
    };
    drawingArea.onmouseenter = () => {
      this.stateHandler.resetCanvasHandlers();
    };
    drawingArea.onmouseleave = () => {
      this.stateHandler.resetCanvasHandlers();
    };
  }

  private registerSingleMouseHandler(drawingArea: SVGElement) {
    for (let i = 0; i < drawingArea.children.length; i++) {
      const e = drawingArea.children[i] as HTMLElement;
      if (e.nodeName === 'rect' || e.nodeName === 'circle') {
        this.registerMouseHandlerForDraggable(this.createDraggable(e));
      }
    }
  }

  private registerMouseHandlerForDraggable(element: Draggable | null) {
    if (element === null) {
      return;
    }
    element.htmlElement.onmouseenter = () => {
      this.stateHandler.disableMouseMoveForRun();
    };

    element.htmlElement.onmousedown = (e) => {
      this.stateHandler.initMouseDownForDraggable(e);
    };

    element.htmlElement.onmousemove = (e) => {
      if (this.stateHandler.draggableCanBeMoved(element, e)) {
        this.moveDraggable(this.stateHandler.getMovedDraggable() as Draggable);
      }
    };
    element.htmlElement.onmouseleave = () => {
      this.stateHandler.disableFocusForChildElement();
    };
    element.htmlElement.onmouseup = () => {
      this.resetChildElementIfExisting();
      this.stateHandler.resetGlobalHandlers();
    };
  }

  private resetChildElementIfExisting(): void {
    const movedChildElement = this.stateHandler.getMovedDraggable();
    if (movedChildElement !== undefined) {
      MoveElementsService.resetPositionForDraggable(movedChildElement);
    }
  }

  private moveChildElementIfExisting(): void {
    const movedChildElement = this.stateHandler.getMovedDraggable();
    if (movedChildElement !== undefined) {
      this.moveDraggable(movedChildElement);
    }
  }

  private moveDraggable(draggable: Draggable) {
    this.determineActiveNeighbourElement(draggable);
    const y = this.stateHandler.getVerticalChanges();
    const transition = draggable.htmlElement;
    const currentCoords =
      FindElementsService.createCoordsFromElement(transition);
    const currentY = currentCoords.y;
    const newY = currentY + y;
    const originalY = asInt(transition, originalYAttribute);
    if (originalY === 0) {
      transition.setAttribute(originalYAttribute, `${currentY}`);
    }
    if (this.checkForPassedElement(transition)) {
      this.handlePassedElement(draggable);
    } else {
      MoveElementsService.moveElement(draggable, newY);
    }
  }

  private handlePassedElement(draggable: Draggable) {
    const passedElement = this.stateHandler.getActiveNeighbourElement();
    const movingElement = draggable.htmlElement;
    if (passedElement === undefined) {
      return;
    }
    MoveElementsService.switchElements(draggable, passedElement);

    const movedLayerPos = asInt(movingElement, layerPosYAttibute);
    const passedLayerPos = asInt(passedElement.htmlElement, layerPosYAttibute);
    movingElement.setAttribute(layerPosYAttibute, `${passedLayerPos}`);
    passedElement.htmlElement.setAttribute(
      layerPosYAttibute,
      `${movedLayerPos}`
    );
    this.persistLayerPosition([passedElement.htmlElement, movingElement]);

    movingElement.removeAttribute(originalYAttribute);
    passedElement.htmlElement.removeAttribute(originalYAttribute);

    this.stateHandler.resetCanvasHandlers();
  }

  private checkForPassedElement(movingElement: HTMLElement): boolean {
    const activeNeighbour = this.stateHandler.getActiveNeighbourElement();
    if (activeNeighbour === undefined) {
      return false;
    }
    const yMoving = asInt(movingElement, getYAttribute(movingElement));
    const yOriginal = asInt(movingElement, originalYAttribute);
    const yPassed = asInt(
      activeNeighbour.htmlElement,
      getYAttribute(activeNeighbour.htmlElement)
    );
    const direction = MoveElementsService.getMoveDirection(movingElement);
    if (!direction) {
      return false;
    }
    const offset = MoveElementsService.calculateOffset(
      movingElement,
      activeNeighbour,
      direction
    );
    if (direction === 'up') {
      return yMoving < yPassed + offset && yOriginal > yPassed;
    }
    return yMoving > yPassed + offset && yOriginal < yPassed;
  }

  private determineActiveNeighbourElement(movedElement: Draggable): void {
    if (!movedElement || !this.drawingArea) {
      return;
    }

    const transition = movedElement.htmlElement;
    const yAttribute = getYAttribute(transition);
    const direction = MoveElementsService.getMoveDirection(transition);
    if (!direction) {
      return;
    }
    const potentialNeighbours = FindElementsService.findElementsInYAxis(
      transition,
      this.drawingArea
    );
    potentialNeighbours.forEach((e) => {
      const eLocal = e as HTMLElement;
      if (
        asInt(eLocal, originalYAttribute) > 0 &&
        eLocal.getAttribute(originalYAttribute) ===
          transition.getAttribute(originalYAttribute)
      ) {
        return;
      }
      const localYAttribute = getYAttribute(eLocal);
      const draggable = DraggingCreationService.createDraggableFromElement(
        eLocal,
        this.drawingArea
      );
      if (direction === 'up') {
        if (asInt(e, localYAttribute) < asInt(transition, yAttribute)) {
          if (draggable !== null) {
            this.stateHandler.setActiveNeighbourElement(draggable, direction);
          }
        }
      }
      if (direction === 'down') {
        if (asInt(eLocal, localYAttribute) > asInt(transition, yAttribute)) {
          if (draggable !== null) {
            this.stateHandler.setActiveNeighbourElement(draggable, direction);
          }
        }
      }
    });
  }

  persistLayerPosition(elements: Array<HTMLElement>): void {
    const coordinates = this.getCoordinates(elements);
    this.coordinateChanged.next(coordinates);
  }

  public createDraggable(element: HTMLElement): Draggable | null {
    return DraggingCreationService.createDraggableFromElement(
      element,
      this.drawingArea
    );
  }

  public getCoordinates(elements: Array<HTMLElement>): CoordinatesInfo[] {
    const coordinatesInfo = [] as CoordinatesInfo[];
    elements.forEach((element) => {
      const y = asInt(element, layerPosYAttibute);
      let x = -1;
      let infoText = element.getAttribute(idAttribute) ?? '';
      if (element.nodeName === 'circle') {
        x = asInt(element, breakpointPositionAttribute);
        infoText =
          element.getAttribute(fromTransitionAttribute) +
          ' ' +
          element.getAttribute(toTransitionAttribute);
        const breakPoints =
          element.getAttribute(breakpointTrail)?.split(',') ?? [];
        for (let i = 0; i < breakPoints.length; i++) {
          const breakPoint = breakPoints[i].split(':');
          if (i === x) {
            infoText += '[' + (y + 1) + ']';
          } else {
            infoText += '[' + (parseInt(breakPoint[1]) + 1) + ']';
          }
        }
      }
      coordinatesInfo.push({
        transitionName: infoText.trim(),
        transitionType: element.nodeName,
        coordinates: {
          x: x + 1,
          y: y + 1,
        },
        globalOffset: {
          x: x + 1,
          y: y + 1,
        },
      });
    });
    return coordinatesInfo;
  }
}
