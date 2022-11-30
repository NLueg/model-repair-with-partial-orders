import { X2jOptionsOptional, XMLParser } from 'fast-xml-parser';

import {
  arcsAttribute,
  transitionsAttribute,
  typeKey,
} from '../../parser/parsing-constants';
import { PnmlPage, PnmlWrapper } from './pnml.type';

export function getRunTextFromPnml(xmlContent: string): string {
  const options: X2jOptionsOptional = {
    attributeNamePrefix: '',
    ignoreAttributes: false,
    allowBooleanAttributes: true,
  };
  const parser = new XMLParser(options);

  const pnml: PnmlWrapper = parser.parse(xmlContent);
  const page: PnmlPage = pnml.pnml.net.page ?? pnml.pnml.net;

  const lines = [typeKey];
  lines.push(transitionsAttribute);
  page.transition.forEach((transition) => {
    const name = transition.name?.text;
    if (name && name !== transition.id) {
      lines.push(`${transition.id} | ${name}`);
    } else {
      lines.push(transition.id);
    }
  });

  lines.push(arcsAttribute);
  lines.push(...getArcsLinkedWithPlaces(page));

  return lines.join('\n');
}

function getArcsLinkedWithPlaces(page: PnmlPage): string[] {
  const places = page.place;

  const runArcs: { source: string; target: string }[] = [];
  for (const arc of page.arc) {
    const sourceIsPlace = places.find((place) => place.id === arc.source);

    // If the source is a place we skip this arc.
    // The linking of transitions is handled with places that are targets
    if (sourceIsPlace) {
      continue;
    }

    // One of the transitions have to be a place
    const targetIsPlace = places.find((place) => place.id === arc.target);
    if (!targetIsPlace) {
      continue;
    }

    const transitionsThatAreTargetedByThePlace = page.arc
      .filter((anotherArc) => anotherArc.source === arc.target)
      .map((anotherArc) => anotherArc.target);
    runArcs.push(
      ...transitionsThatAreTargetedByThePlace.map((target) => ({
        source: arc.source,
        target,
      }))
    );
  }

  return runArcs.map((runArc) => `${runArc.source} ${runArc.target}`);
}
