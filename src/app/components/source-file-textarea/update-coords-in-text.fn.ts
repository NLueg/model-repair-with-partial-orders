import { CoordinatesInfo } from '../../classes/diagram/coordinates';

export function updateCoordsInText(
  initialValue: string,
  coordinatesInfo: CoordinatesInfo[]
): string {
  let newValue = initialValue;
  coordinatesInfo.forEach((infoElement) => {
    if (
      infoElement.transitionType === 'rect' ||
      infoElement.transitionType === 'circle'
    ) {
      let infoText = infoElement.transitionName;
      if (infoElement.transitionType === 'rect') {
        const eventIdArray = newValue.match(
          new RegExp(`\n${infoText}\\s+(\\|.*)?(\\[\\d+\\])?\\n`, 'g')
        );
        if (eventIdArray) {
          infoText = eventIdArray[0]
            .replace(/(\r\n|\n|\r)/gm, '')
            .split('[')[0]
            .trim();
        }
      }
      let patternString = `\\n${infoText.replace(
        new RegExp('\\[\\d+\\]', 'g'),
        ''
      )}(\\[\\d+\\])*?\\n`;
      let coordsString = `\n${infoElement.transitionName}\n`;
      if (infoElement.transitionType === 'rect') {
        coordsString = `\n${infoText} [${infoElement.coordinates.y}]\n`;
        patternString = `\\n${infoText.replace(
          '|',
          '\\|'
        )}(\\s*\\[\\-?\\d+])?\\s*\\n`;
      }
      const replacePattern = new RegExp(patternString, 'g');
      newValue = newValue.replace(replacePattern, coordsString);
    }
  });
  return newValue;
}

export function removeCoordinates(value: string): string {
  const contentLines = value.split('\n');
  let newText = '';
  let first = true;
  for (const line of contentLines) {
    if (first) {
      newText = newText + line.split('[')[0];
      first = false;
    } else {
      newText = `${newText}\n${line.split('[')[0].trim()}`;
    }
  }
  return newText;
}
