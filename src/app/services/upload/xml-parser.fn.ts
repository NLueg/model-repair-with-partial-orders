import { X2jOptionsOptional, XMLParser } from 'fast-xml-parser';

export function parseXml<T>(xmlContent: string): T {
  const options: X2jOptionsOptional = {
    attributeNamePrefix: '',
    ignoreAttributes: false,
    allowBooleanAttributes: true,
  };
  const parser = new XMLParser(options);

  return parser.parse(xmlContent);
}
