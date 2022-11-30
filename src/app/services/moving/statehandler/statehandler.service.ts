import { Injectable } from '@angular/core';

import { Coordinates } from '../../../classes/diagram/coordinates';
import { Draggable } from '../../../classes/diagram/draggable';
import { FindElementsService } from '../find/find-elements.service';
import { MoveElementsService } from '../move/move-elements.service';

@Injectable({
  providedIn: 'root',
})
export class StatehandlerService {
  persistCoordinates = true;

  private _mouseMoveRun: boolean;
  private _childElementInFocus: boolean;
  private _runMoved: boolean;
  private _globalChanges: Coordinates = { x: 0, y: 0 };
  private _localChanges: Coordinates = { x: 0, y: 0 };
  private _localChangesRun: Coordinates = { x: 0, y: 0 };
  private _globalChangesRun: Coordinates = { x: 0, y: 0 };
  private _movedChildElement?: Draggable;
  private _activeNeighbourElement?: Draggable;

  constructor() {
    this._mouseMoveRun = false;
    this._childElementInFocus = false;
    this._runMoved = false;
  }

  public resetOffset(newCoordinates: Coordinates): void {
    this._globalChangesRun.x = newCoordinates.x;
    this._globalChangesRun.y = newCoordinates.y;
  }

  public initMouseDownForRun(event: MouseEvent): void {
    this._mouseMoveRun = !this._mouseMoveRun;
    this._localChangesRun = {
      x: 0,
      y: 0,
    };
    this._globalChanges = {
      x: event.offsetX,
      y: event.offsetY,
    };
  }

  initMouseDownForDraggable(event: MouseEvent): void {
    this._globalChanges = {
      x: event.offsetX,
      y: event.offsetY,
    };
    this._mouseMoveRun = false;
    this._childElementInFocus = true;
  }

  public updateChangeStateRun(event: MouseEvent): void {
    this._localChangesRun = {
      x: event.offsetX - this._globalChanges.x,
      y: event.offsetY - this._globalChanges.y,
    };
    if (this._localChangesRun.x !== 0 || this._localChangesRun.y !== 0) {
      this._runMoved = true;
    }
    this._globalChangesRun.x += this._localChangesRun.x;
    this._globalChangesRun.y += this._localChangesRun.y;
    this._localChanges = {
      x: event.offsetX - this._globalChanges.x,
      y: event.offsetY - this._globalChanges.y,
    };
    this._globalChanges = {
      x: event.offsetX,
      y: event.offsetY,
    };
  }

  updateChangeStateDraggable(event: MouseEvent): void {
    this._localChanges = {
      x: event.offsetX - this._globalChanges.x,
      y: event.offsetY - this._globalChanges.y,
    };
    this._globalChanges = {
      x: event.offsetX,
      y: event.offsetY,
    };
  }

  setActiveNeighbourElement(draggable: Draggable, direction: string): void {
    if (this._activeNeighbourElement === undefined) {
      this._activeNeighbourElement = draggable;
    }
    const movingCoords = FindElementsService.createCoordsFromElement(
      draggable.event
    );
    if (this._activeNeighbourElement) {
      const neighbourCoords = FindElementsService.createCoordsFromElement(
        this._activeNeighbourElement.event
      );
      if (direction === 'up' && movingCoords.y > neighbourCoords.y) {
        this._activeNeighbourElement = draggable;
      }
      if (direction === 'down' && movingCoords.y < neighbourCoords.y) {
        this._activeNeighbourElement = draggable;
      }
    }
  }

  public resetCanvasHandlers(): void {
    if (this._movedChildElement !== undefined) {
      MoveElementsService.resetPositionForDraggable(this._movedChildElement);
    }
    this.resetGlobalState();
  }

  public resetGlobalState(): void {
    this._childElementInFocus = false;
    this._mouseMoveRun = false;
    this._movedChildElement = undefined;
    this._activeNeighbourElement = undefined;
    this._runMoved = false;
  }

  public getLocalChangesForRun(): Coordinates {
    return this._localChangesRun;
  }

  public getGlobalChangesForRun(): Coordinates {
    return this._globalChangesRun;
  }

  public runIsMoving(): boolean {
    return (
      this._mouseMoveRun &&
      !this._childElementInFocus &&
      !this._movedChildElement
    );
  }

  public childIsBeingDragged(): boolean {
    return this._movedChildElement !== undefined && !this._childElementInFocus;
  }

  public getMovedDraggable(): Draggable | undefined {
    return this._movedChildElement;
  }

  public runIsMoved(): boolean {
    return this._runMoved;
  }

  public getVerticalChanges(): number {
    return this._localChanges.y;
  }

  public disableMouseMoveForRun(): void {
    this._mouseMoveRun = false;
  }

  public disableFocusForChildElement(): void {
    this._childElementInFocus = false;
  }

  public getActiveNeighbourElement(): Draggable | undefined {
    return this._activeNeighbourElement;
  }

  public draggableCanBeMoved(element: Draggable, event: MouseEvent): boolean {
    if (this._childElementInFocus) {
      if (this._movedChildElement === undefined) {
        this._movedChildElement = element;
      }
      this.updateChangeStateDraggable(event);
      return true;
    }
    return false;
  }

  public resetGlobalHandlers(): void {
    this._childElementInFocus = false;
    this._mouseMoveRun = false;
    this._movedChildElement = undefined;
    this._activeNeighbourElement = undefined;
    this._runMoved = false;
  }
}
