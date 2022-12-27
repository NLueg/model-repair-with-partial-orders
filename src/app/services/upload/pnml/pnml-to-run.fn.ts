import { X2jOptionsOptional, XMLParser } from 'fast-xml-parser';

import {
  arcsAttribute,
  eventsAttribute,
  netTypeKey, placesAttribute, transitionsAttribute,
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

    const lines = [netTypeKey];
    lines.push(transitionsAttribute);
    page.transition.forEach((transition) => {
        const name = transition.name?.text;

        if (name) {
          lines.push(`${transition.id} ${name.replace(/\s/g, '_')}`);
        } else {
          lines.push(transition.id);
        }
    });
    lines.push(placesAttribute);
    page.place.forEach((place) => {
      lines.push(`${place.id} ${place.initialMarking?.text ?? 0}`);
    });

    lines.push(arcsAttribute);
    page.arc.forEach((arc) => {
      lines.push(`${arc.source} ${arc.target}`);
    });

    return lines.join('\n');
}

