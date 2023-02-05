import { parseXml } from '../xml-parser.fn';
import { XesWrapper } from './xes.model';

const logStart = `.type log
.attributes
case-id
concept:name
event-id
follows[]
.events`;

export function parseXesFileToCustomLogFormat(xmlContent: string): string {
  const xes: XesWrapper = parseXml(xmlContent);
  const traces = xes.log.trace;

  let text = logStart;

  for (let i = 0; i < traces.length; i++) {
    const trace = traces[i];
    const traceId =
      trace.string.find((s) => s.key === 'concept:name')?.value ?? i;

    for (let j = 0; j < trace.event.length; j++) {
      const event = trace.event[j];
      const eventName = event.string.find(
        (s) => s.key === 'concept:name'
      )?.value;
      if (!eventName) {
        throw Error(`Event name is not defined in trace ${i} and event ${j}!`);
      }

      const replacedEventName = eventName.replace(/\s/g, '_');
      text += `\n${traceId} ${replacedEventName} ${j}`;
    }
  }

  return text;
}
