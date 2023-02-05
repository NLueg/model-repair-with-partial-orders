import {
  arcsAttribute,
  netTypeKey,
  placesAttribute,
  transitionsAttribute,
} from '../../parser/parsing-constants';
import { parseXml } from '../xml-parser.fn';
import { PnmlPage, PnmlWrapper } from './pnml.type';

export function getRunTextFromPnml(xmlContent: string): string {
  const pnml: PnmlWrapper = parseXml(xmlContent);
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
