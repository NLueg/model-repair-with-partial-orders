import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { Subscription } from 'rxjs';
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
  eventIdAttribute,
  fromTransitionAttribute,
  layerPosYAttibute,
  originalYAttribute,
  toTransitionAttribute,
} from '../../services/svg/svg-constants';

@Component({
  selector: 'app-canvas',
  templateUrl: './canvas.component.html',
  styleUrls: ['./canvas.component.scss'],
})
export class CanvasComponent implements OnChanges, OnDestroy {
  @ViewChild('drawingArea') drawingArea: ElementRef<SVGElement> | undefined;

  @Input()
  svgElements: SVGElement[] = [];

  @Input()
  canvasHeight = 400;

  @Input()
  persistUiChangesForRunInTextarea = true;

  @Output()
  coordinateChanged = new EventEmitter<CoordinatesInfo[]>();

  private _sub: Subscription | undefined;
  private _offsetSub: Subscription;
  private _updateOffsetSub: Subscription;

  constructor(
    private _svgService: SvgService,
    private _displayService: DisplayService,
    private _stateHandler: StatehandlerService
  ) {
    this._offsetSub = this._displayService
      .offsetInfoAdded()
      .subscribe((val) => this._stateHandler.resetOffset(val));
    this._updateOffsetSub = this._displayService
      .offsetInfoUpdated()
      .subscribe((val) => this._stateHandler.resetOffset(val));
  }

  ngOnDestroy(): void {
    this._sub?.unsubscribe();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['svgElements'] && this.drawingArea) {
      this.clearDrawingArea();
      for (const element of this.svgElements) {
        this.drawingArea.nativeElement.appendChild(element);
      }
      this.registerCanvasMouseHandler(this.drawingArea.nativeElement);
      this.registerSingleMouseHandler(this.drawingArea.nativeElement);
    }
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
      this._stateHandler.initMouseDownForRun(e);
    };

    drawingArea.onmousemove = (e) => {
      if (this._stateHandler.childIsBeingDragged()) {
        this.moveChildElementIfExisting();
        this._stateHandler.updateChangeStateDraggable(e);
      }
      if (this._stateHandler.runIsMoving()) {
        this._stateHandler.updateChangeStateRun(e);
        MoveElementsService.moveRun(
          drawingArea,
          this._stateHandler.getLocalChangesForRun()
        );
      }
    };
    drawingArea.onmouseup = () => {
      if (this.persistUiChangesForRunInTextarea) {
        this.persistOffset();
      }
      this._stateHandler.resetCanvasHandlers();
    };
    drawingArea.onmouseenter = () => {
      this._stateHandler.resetCanvasHandlers();
    };
    drawingArea.onmouseleave = () => {
      this._stateHandler.resetCanvasHandlers();
    };
  }

  private persistOffset() {
    if (!this.persistUiChangesForRunInTextarea) {
      return;
    }

    if (this._stateHandler.runIsMoved()) {
      this._displayService.setOffsetInfo(
        this._stateHandler.getGlobalChangesForRun()
      );
    }
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
    element.event.onmouseenter = () => {
      this._stateHandler.disableMouseMoveForRun();
    };

    element.event.onmousedown = (e) => {
      this._stateHandler.initMouseDownForDraggable(e);
    };

    element.event.onmousemove = (e) => {
      if (this._stateHandler.draggableCanBeMoved(element, e)) {
        this.moveDraggable(this._stateHandler.getMovedDraggable() as Draggable);
      }
    };
    element.event.onmouseleave = () => {
      this._stateHandler.disableFocusForChildElement();
    };
    element.event.onmouseup = () => {
      this.resetChildElementIfExisting();
      this._stateHandler.resetGlobalHandlers();
    };
  }

  private resetChildElementIfExisting(): void {
    const movedChildElement = this._stateHandler.getMovedDraggable();
    if (movedChildElement !== undefined) {
      MoveElementsService.resetPositionForDraggable(movedChildElement);
    }
  }

  private moveChildElementIfExisting(): void {
    const movedChildElement = this._stateHandler.getMovedDraggable();
    if (movedChildElement !== undefined) {
      this.moveDraggable(movedChildElement);
    }
  }

  private moveDraggable(draggable: Draggable) {
    this.determineActiveNeighbourElement(draggable);
    const y = this._stateHandler.getVerticalChanges();
    const transition = draggable.event;
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
    const passedElement = this._stateHandler.getActiveNeighbourElement();
    const movingElement = draggable.event;
    if (passedElement === undefined) {
      return;
    }
    MoveElementsService.switchElements(draggable, passedElement);

    const movedLayerPos = asInt(movingElement, layerPosYAttibute);
    const passedLayerPos = asInt(passedElement.event, layerPosYAttibute);
    movingElement.setAttribute(layerPosYAttibute, `${passedLayerPos}`);
    passedElement.event.setAttribute(layerPosYAttibute, `${movedLayerPos}`);
    this.persistLayerPosition([passedElement.event, movingElement]);

    movingElement.removeAttribute(originalYAttribute);
    passedElement.event.removeAttribute(originalYAttribute);

    this._stateHandler.resetCanvasHandlers();
  }

  private checkForPassedElement(movingElement: HTMLElement): boolean {
    const activeNeighbour = this._stateHandler.getActiveNeighbourElement();
    if (activeNeighbour === undefined) {
      return false;
    }
    const yMoving = asInt(movingElement, getYAttribute(movingElement));
    const yOriginal = asInt(movingElement, originalYAttribute);
    const yPassed = asInt(
      activeNeighbour.event,
      getYAttribute(activeNeighbour.event)
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

    const transition = movedElement.event;
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
            this._stateHandler.setActiveNeighbourElement(draggable, direction);
          }
        }
      }
      if (direction === 'down') {
        if (asInt(eLocal, localYAttribute) > asInt(transition, yAttribute)) {
          if (draggable !== null) {
            this._stateHandler.setActiveNeighbourElement(draggable, direction);
          }
        }
      }
    });
  }

  persistLayerPosition(elements: Array<HTMLElement>): void {
    const coordinates = this.getCoordinates(elements);
    this.coordinateChanged.next(coordinates);

    if (this.persistUiChangesForRunInTextarea) {
      this._displayService.setCoordsInfo(coordinates);
    }
  }

  public createDraggable(element: HTMLElement): Draggable | null {
    return DraggingCreationService.createDraggableFromElement(
      element,
      this.drawingArea
    );
  }

  public findInfoText(element: HTMLElement): string {
    if (!this.drawingArea) {
      return '';
    }
    return (
      DraggingCreationService.findInfoElementForTransition(
        element,
        this.drawingArea
      )?.textContent ?? ''
    );
  }

  public getCoordinates(elements: Array<HTMLElement>): CoordinatesInfo[] {
    const coordinatesInfo = [] as CoordinatesInfo[];
    elements.forEach((element) => {
      const y = asInt(element, layerPosYAttibute);
      let x = -1;
      let infoText = element.getAttribute(eventIdAttribute) ?? '';
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
