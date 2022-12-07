import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Breakpoint } from 'src/app/classes/diagram/arc';

import { EventLog } from '../../classes/diagram/event-log';
import { hasCycles } from '../../classes/diagram/functions/cycles.fn';
import {
  addArc,
  addPlace,
  addTransition,
  removeCycles,
  setRefs,
} from '../../classes/diagram/functions/net-helper.fn';
import { PetriNet } from '../../classes/diagram/petri-net';
import { Place } from '../../classes/diagram/place';
import { Transition } from '../../classes/diagram/transition';
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

  parseLog(content: string, errors: Set<string>): EventLog | null {
    const contentLines = content.split('\n');
    const log: EventLog = {
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
            const transition = this.parseTransition(trimmedLine);

            if (!addTransition(log, transition)) {
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
            let source: string, target: string;
            const breakpoints: Breakpoint[] = [];

            if (this.arcRegex.test(trimmedLine)) {
              const match = this.arcRegex.exec(trimmedLine);

              if (match) {
                source = match[1];
                target = match[2];
              } else {
                const splitLine = trimmedLine.split(' ');
                source = splitLine[0];
                target = splitLine[1];
              }

              if (
                !addArc(log, {
                  source: source,
                  target: target,
                  breakpoints: breakpoints,
                })
              ) {
                this.toastr.warning(
                  `File contains duplicate arcs`,
                  `Duplicate arcs are ignored`
                );
              } else {
                const arc = log.arcs.find(
                  (a) => a.source === source && a.target === target
                );
                if (arc) {
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

    return log;
  }

  parsePetriNet(content: string, errors: Set<string>): PetriNet | null {
    const contentLines = content.split('\n');
    const run: PetriNet = {
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

            if (!addTransition(run, transition)) {
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

            if (!addPlace(run, place)) {
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
            let source: string, target: string;
            const breakpoints: Breakpoint[] = [];

            if (this.arcRegex.test(trimmedLine)) {
              const match = this.arcRegex.exec(trimmedLine);

              if (match) {
                source = match[1];
                target = match[2];
              } else {
                const splitLine = trimmedLine.split(' ');
                source = splitLine[0];
                target = splitLine[1];
              }

              if (
                !addArc(run, {
                  source: source,
                  target: target,
                  breakpoints: breakpoints,
                })
              ) {
                this.toastr.warning(
                  `File contains duplicate arcs`,
                  `Duplicate arcs are ignored`
                );
              } else {
                const arc = run.arcs.find(
                  (a) => a.source === source && a.target === target
                );
                if (arc) {
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

    if (run.arcs.length === 0 && run.transitions.length === 0) {
      errors.add(`File does not contain events and arcs`);
      this.toastr.error(
        `File does not contain events and arcs`,
        `Unable to parse file`
      );
      return null;
    }

    if (!setRefs(run)) {
      this.toastr.warning(
        `File contains arcs for non existing events`,
        `Invalid arcs are ignored`
      );
    }
    if (hasCycles(run)) {
      removeCycles(run);
      this.toastr.warning(
        `Cyclic arcs are ignored`,
        `File contains cyclic arcs`
      );
    }
    /**
     * TODO: Reactivate this check!!!
     * -> Does not work for arcs which target not exists
    if (hasTransitiveArcs(run)) {
      removeTransitives(run);
      this.toastr.warning(
        `Transitive arcs are ignored`,
        `File contains transitive arcs`
      );
      setRefs(run);
    } */

    return run;
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
