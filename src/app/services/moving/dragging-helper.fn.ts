export function asInt(elem: Element, attribute: string): number {
  return parseInt(elem.getAttribute(attribute) ?? '0');
}

export function getYAttribute(element: HTMLElement): string {
  return element.nodeName === 'rect' ? 'y' : 'cy';
}

export function getXAttribute(element: HTMLElement): string {
  return element.nodeName === 'rect' ? 'x' : 'cx';
}

export function getAttributePrefix(e: HTMLElement): string {
  if (e.nodeName === 'circle') {
    return 'c';
  }
  return '';
}
