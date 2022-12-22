import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Breakpoint } from 'src/app/classes/diagram/arc';

import {
  addArc,
  addEventItem,
  addPlace,
  addTransition,
  setRefs,
} from '../../classes/diagram/functions/net-helper.fn';
import {
  determineInitialAndFinalEvents,
  PartialOrder,
} from '../../classes/diagram/partial-order';
import { PetriNet } from '../../classes/diagram/petri-net';
import { Place } from '../../classes/diagram/place';
import {
  concatEvents,
  EventItem,
  Transition,
} from '../../classes/diagram/transition';
import {
  arcsAttribute,
  eventsAttribute,
  logTypeKey,
  netTypeKey,
  placesAttribute,
  transitionsAttribute,
} from './parsing-constants';

type ParsingStates = 'initial' | 'type' | 'transitions' | 'places' | 'arcs';

@Injectable({
  providedIn: 'root',
})
export class ParserService {
  constructor(private toastr: ToastrService) {}

  private readonly transitionRegex = /^(\S*)\s*(.*)$/;
  private readonly placeRegex = /^(\S*)\s*(\d*)$/;
  private readonly arcRegex = /^(\S*)\s*(\S*)\s*(\d*)$/;
  private readonly breakpointRegex = new RegExp('\\[\\d+\\]');

  parsePartialOrder(content: string, errors: Set<string>): PartialOrder | null {
    const contentLines = content.split('\n');
    const partialOrder: PartialOrder = {
      text: content,
      events: [],
      arcs: [],
    };

    let currentParsingState: ParsingStates = 'initial';
    for (const line of contentLines) {
      const trimmedLine = line.trim();
      if (trimmedLine === '') {
        continue;
      }

      switch (currentParsingState) {
        case 'initial':
          if (trimmedLine === logTypeKey) {
            currentParsingState = 'type';
          } else {
            errors.add(
              `The type of the file with the net has to be '` + netTypeKey + `'`
            );
            this.toastr.error(
              `The type has to be '` + netTypeKey + `'`,
              `Unable to parse file`
            );
            return null;
          }
          break;
        case 'type':
          if (trimmedLine === eventsAttribute) {
            currentParsingState = 'transitions';
            break;
          } else if (trimmedLine === arcsAttribute) {
            currentParsingState = 'arcs';
            break;
          } else {
            errors.add(`The file contains invalid parts`);
            this.toastr.error(
              `The file contains invalid parts`,
              `Unable to parse file`
            );
            return null;
          }
        case 'transitions':
          if (trimmedLine !== arcsAttribute) {
            const transition = this.parseEventItem(trimmedLine);

            if (!addEventItem(partialOrder, transition)) {
              this.toastr.warning(
                `File contains duplicate transitions`,
                `Duplicate transitions are ignored`
              );
            }
            break;
          } else if (trimmedLine === arcsAttribute) {
            currentParsingState = 'arcs';
            break;
          } else if (trimmedLine === placesAttribute) {
            currentParsingState = 'places';
            break;
          } else {
            errors.add(`Unable to parse file`);
            this.toastr.error(`Error`, `Unable to parse file`);
            return null;
          }
        case 'arcs':
          if (
            trimmedLine !== eventsAttribute &&
            trimmedLine !== placesAttribute
          ) {
            let source: string, target: string, weight: number;
            const breakpoints: Breakpoint[] = [];

            if (this.arcRegex.test(trimmedLine)) {
              const match = this.arcRegex.exec(trimmedLine);

              if (match) {
                source = match[1];
                target = match[2];
                weight = Number(match[3]);
              } else {
                const splitLine = trimmedLine.split(' ');
                source = splitLine[0];
                target = splitLine[1];
                weight = Number(splitLine[2]);
              }

              const arc = {
                weight: weight || 1,
                source: source,
                target: target,
                breakpoints: breakpoints,
              };
              if (!addArc(partialOrder, arc)) {
                this.toastr.warning(
                  `File contains duplicate arcs`,
                  `Duplicate arcs are ignored`
                );
              } else {
                const source = partialOrder.events.find(
                  (event) => event.id === arc.source
                );
                const target = partialOrder.events.find(
                  (event) => event.id === arc.target
                );
                if (source && target) {
                  concatEvents(source, target);
                }

                let trimmedLineTmp = trimmedLine;
                while (this.breakpointRegex.test(trimmedLineTmp)) {
                  const layerPos = parseInt(
                    trimmedLineTmp.substring(
                      trimmedLineTmp.indexOf('[') + 1,
                      trimmedLineTmp.indexOf(']')
                    )
                  );
                  breakpoints.push({
                    x: 0,
                    y: 0,
                    layerPos: layerPos,
                    arc: arc,
                  });
                  arc.breakpoints = breakpoints;
                  trimmedLineTmp = trimmedLineTmp.substring(
                    trimmedLineTmp.indexOf(']') + 1
                  );
                }
              }
            } else {
              this.toastr.warning(
                `Invalid arcs are ignored`,
                `File contains invalid arcs`
              );
            }
            break;
          } else if (trimmedLine === eventsAttribute) {
            currentParsingState = 'transitions';
            break;
          } else {
            errors.add(`Unable to parse file`);
            this.toastr.error(`Error`, `Unable to parse file`);
            return null;
          }
      }
    }
    determineInitialAndFinalEvents(partialOrder);
    return partialOrder;
  }

  parsePetriNet(content: string, errors: Set<string>): PetriNet | null {
    const contentLines = content.split('\n');
    const petriNet: PetriNet = {
      text: content,
      transitions: [],
      arcs: [],
      places: [],
    };

    let currentParsingState: ParsingStates = 'initial';
    this.toastr.toasts.forEach((t) => {
      this.toastr.remove(t.toastId);
    });

    for (const line of contentLines) {
      const trimmedLine = line.trim();
      if (trimmedLine === '') {
        continue;
      }

      switch (currentParsingState) {
        case 'initial':
          if (trimmedLine === netTypeKey) {
            currentParsingState = 'type';
            break;
          } else {
            errors.add(
              `The type of the file with the net has to be '` + netTypeKey + `'`
            );
            this.toastr.error(
              `The type has to be '` + netTypeKey + `'`,
              `Unable to parse file`
            );
            return null;
          }
        case 'type':
          if (trimmedLine === transitionsAttribute) {
            currentParsingState = 'transitions';
            break;
          } else if (trimmedLine === arcsAttribute) {
            currentParsingState = 'arcs';
            break;
          } else if (trimmedLine === placesAttribute) {
            currentParsingState = 'places';
            break;
          } else {
            errors.add(`The file contains invalid parts`);
            this.toastr.error(
              `The file contains invalid parts`,
              `Unable to parse file`
            );
            return null;
          }
        case 'transitions':
          if (
            trimmedLine !== arcsAttribute &&
            trimmedLine !== placesAttribute
          ) {
            const transition = this.parseTransition(trimmedLine);

            if (!addTransition(petriNet, transition)) {
              this.toastr.warning(
                `File contains duplicate transitions`,
                `Duplicate transitions are ignored`
              );
            }
            break;
          } else if (trimmedLine === arcsAttribute) {
            currentParsingState = 'arcs';
            break;
          } else if (trimmedLine === placesAttribute) {
            currentParsingState = 'places';
            break;
          } else {
            errors.add(`Unable to parse file`);
            this.toastr.error(`Error`, `Unable to parse file`);
            return null;
          }
        case 'places':
          if (
            trimmedLine !== arcsAttribute &&
            trimmedLine !== transitionsAttribute
          ) {
            const place = this.parsePlace(trimmedLine);

            if (!addPlace(petriNet, place)) {
              this.toastr.warning(
                `File contains duplicate places`,
                `Duplicate places are ignored`
              );
            }
            break;
          } else if (trimmedLine === arcsAttribute) {
            currentParsingState = 'arcs';
            break;
          } else if (trimmedLine === transitionsAttribute) {
            currentParsingState = 'transitions';
            break;
          } else {
            errors.add(`Unable to parse file`);
            this.toastr.error(`Error`, `Unable to parse file`);
            return null;
          }
        case 'arcs':
          if (
            trimmedLine !== transitionsAttribute &&
            trimmedLine !== placesAttribute
          ) {
            let source: string, target: string, weight: number;
            const breakpoints: Breakpoint[] = [];

            if (this.arcRegex.test(trimmedLine)) {
              const match = this.arcRegex.exec(trimmedLine);

              if (match) {
                source = match[1];
                target = match[2];
                weight = Number(match[3]);
              } else {
                const splitLine = trimmedLine.split(' ');
                source = splitLine[0];
                target = splitLine[1];
                weight = Number(splitLine[2]);
              }

              const arc = {
                weight: weight || 1,
                source: source,
                target: target,
                breakpoints: breakpoints,
              };
              if (!addArc(petriNet, arc)) {
                this.toastr.warning(
                  `File contains duplicate arcs`,
                  `Duplicate arcs are ignored`
                );
              } else {
                let trimmedLineTmp = trimmedLine;
                while (this.breakpointRegex.test(trimmedLineTmp)) {
                  const layerPos = parseInt(
                    trimmedLineTmp.substring(
                      trimmedLineTmp.indexOf('[') + 1,
                      trimmedLineTmp.indexOf(']')
                    )
                  );
                  breakpoints.push({
                    x: 0,
                    y: 0,
                    layerPos: layerPos,
                    arc: arc,
                  });
                  arc.breakpoints = breakpoints;
                  trimmedLineTmp = trimmedLineTmp.substring(
                    trimmedLineTmp.indexOf(']') + 1
                  );
                }
              }
            } else {
              this.toastr.warning(
                `Invalid arcs are ignored`,
                `File contains invalid arcs`
              );
            }
            break;
          } else if (trimmedLine === transitionsAttribute) {
            currentParsingState = 'transitions';
            break;
          } else {
            errors.add(`Unable to parse file`);
            this.toastr.error(`Error`, `Unable to parse file`);
            return null;
          }
      }
    }

    if (petriNet.arcs.length === 0 && petriNet.transitions.length === 0) {
      errors.add(`File does not contain events and arcs`);
      this.toastr.error(
        `File does not contain events and arcs`,
        `Unable to parse file`
      );
      return null;
    }

    if (!setRefs(petriNet)) {
      this.toastr.warning(
        `File contains arcs for non existing events`,
        `Invalid arcs are ignored`
      );
    }

    /**
     * TODO: Reactivate this check!!!
     * -> Does not work for arcs which target not exists
    if (hasTransitiveArcs(petriNet)) {
      removeTransitives(petriNet);
      this.toastr.warning(
        `Transitive arcs are ignored`,
        `File contains transitive arcs`
      );
      setRefs(petriNet);
    } */

    return petriNet;
  }

  private parseTransition(trimmedLine: string): Transition {
    const match = this.transitionRegex.exec(trimmedLine);
    const id = match ? match[1] : trimmedLine;
    const label = match ? match[2] : trimmedLine;

    return {
      id,
      label,
      type: 'transition',
      incomingArcs: [],
      outgoingArcs: [],
    };
  }

  private parseEventItem(trimmedLine: string): EventItem {
    const match = this.transitionRegex.exec(trimmedLine);
    const id = match ? match[1] : trimmedLine;
    const label = match ? match[2] : trimmedLine;

    return {
      id,
      label,
      type: 'event',
      incomingArcs: [],
      outgoingArcs: [],
      nextEvents: [],
      previousEvents: [],
    };
  }

  private parsePlace(trimmedLine: string): Place {
    const match = this.placeRegex.exec(trimmedLine);
    const id = match ? match[1] : trimmedLine;
    const tokens = match ? Number(match[2]) : 0;

    return {
      id,
      type: 'place',
      marking: isNaN(tokens) ? 0 : tokens,
      incomingArcs: [],
      outgoingArcs: [],
    };
  }
}
