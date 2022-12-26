import { PetriNet } from '../../classes/diagram/petri-net';
import {
  arcsAttribute,
  netTypeKey,
  placesAttribute,
  transitionsAttribute,
} from './parsing-constants';

export function getTextFromNet(petriNet: PetriNet): string {
  let newText = `${netTypeKey}\n${transitionsAttribute}\n`;
  petriNet.transitions.forEach((transition) => {
    newText += `${transition.id} ${transition.label}\n`;
  });

  newText += `${placesAttribute}\n`;
  petriNet.places.forEach((place) => {
    newText += `${place.id} ${place.marking}\n`;
  });

  newText += `${arcsAttribute}\n`;
  petriNet.arcs.forEach((arc, index) => {
    newText += `${arc.source} ${arc.target}${
      arc.weight > 1 ? ` ${arc.weight}` : ''
    }`;

    if (index !== petriNet.arcs.length - 1) {
      newText += '\n';
    }
  });

  return newText;
}
