import { CustomEvent } from './event';
import { EventLog } from './event-log';
import {
  BooleanAttribute,
  DateAttribute,
  EventLogAttribute,
  FloatAttribute,
  IntAttribute,
  StringAttribute,
} from './eventlogattribute';
import { Trace } from './trace';

export class LogParser {
  public static PARSING_ERROR = new Error(
    'given .type log string can not be parsed'
  );

  private readonly _undefinedValue = "''";

  private readonly _typeLogElement = '.type log';
  private readonly _attributesElement = '.attributes';
  private readonly _eventsElement = '.events';

  private readonly _caseIdElement = 'case-id';
  private readonly _activityElement = 'concept:name';
  private readonly _escapeString = "'";

  /**
   * Liest einen String im .type log Format ein, das von Robin Bergenthum und Jakub Kovar definiert wurde und wandelt es in die
   * intern verwendete Repräsentation als {@link EventLog} um
   *
   * @param text String im .type log Format, der geparst werden soll
   * @return interne Darstellung als {@link EventLog}
   */
  public parse(text: string): EventLog {
    if (text.trim() === '') {
      return new EventLog([], [], [], [], []);
    }

    const lines: string[] = text.split(/\r?\n/);

    let indexLog;
    try {
      indexLog = LogParser.indexOfTokenIfExists(lines, this._typeLogElement);
    } catch (e) {
      indexLog = -1;
    }
    const indexAttributes = LogParser.indexOfTokenIfExists(
      lines,
      this._attributesElement
    );
    const indexEvents = LogParser.indexOfTokenIfExists(
      lines,
      this._eventsElement
    );
    const max = lines.length;
    const keywordIndices: number[] = [
      indexLog,
      indexAttributes,
      indexEvents,
      max,
    ];

    const attributesLines: string[] = lines.slice(
      indexAttributes + 1,
      LogParser.nextKeyword(keywordIndices, indexAttributes)
    );
    const headers: string[] = attributesLines.map((attribute) =>
      attribute.trim()
    );

    const eventLines: string[] = lines.slice(
      indexEvents + 1,
      LogParser.nextKeyword(keywordIndices, indexEvents)
    );

    const traces: Trace[] = this.parseTraces(headers, eventLines);
    return new EventLog([], [], [], traces, []);
  }

  private parseTraces(headers: string[], eventLines: string[]): Trace[] {
    const asTable = eventLines.map((eventLine) =>
      this.splitEventLineString(eventLine)
    );

    const dictCaseIdentifierToTrace: Map<number, Trace> = new Map();
    asTable.forEach((eventLineSplit) => {
      if (
        eventLineSplit[headers.indexOf(this._caseIdElement)] === undefined ||
        eventLineSplit[headers.indexOf(this._activityElement)] === undefined
      ) {
        throw LogParser.PARSING_ERROR;
      }

      const caseId: number = parseInt(
        eventLineSplit[headers.indexOf(this._caseIdElement)]
      );
      const activity: string =
        eventLineSplit[headers.indexOf(this._activityElement)];

      const eventLogAttributes: EventLogAttribute[] = headers
        .filter(
          (header) =>
            ![this._caseIdElement, this._activityElement].includes(header)
        )
        .filter((header) => headers.indexOf(header) < eventLineSplit.length)
        .filter(
          (header) =>
            eventLineSplit[headers.indexOf(header)] !== this._undefinedValue
        )
        .map((header) =>
          LogParser.eventLogAttributeOf(
            header,
            eventLineSplit[headers.indexOf(header)]
          )
        );

      if (!dictCaseIdentifierToTrace.has(caseId)) {
        dictCaseIdentifierToTrace.set(caseId, new Trace([], [], caseId));
      }
      dictCaseIdentifierToTrace
        .get(caseId)
        ?.events.push(new CustomEvent(eventLogAttributes, activity));
    });

    return Array.from(dictCaseIdentifierToTrace.values());
  }

  private splitEventLineString(eventLine: string): string[] {
    const lineSplit = [];
    while (eventLine !== '') {
      let startIndex: number;
      let endIndex: number | undefined;
      let nextIndex: number | undefined;
      if (eventLine.startsWith(this._undefinedValue)) {
        lineSplit.push(this._undefinedValue);
        eventLine = eventLine.slice(this._undefinedValue.length + 1);
        continue;
      } else if (eventLine.startsWith(this._escapeString)) {
        startIndex = 1;
        for (
          let actIndex = startIndex;
          actIndex < eventLine.length;
          actIndex++
        ) {
          if (
            eventLine.charAt(actIndex) == this._escapeString &&
            eventLine.charAt(actIndex - 1) !== '\\'
          ) {
            endIndex = actIndex;
            nextIndex = endIndex + 2;
            break;
          }
        }
        if (endIndex === undefined || nextIndex === undefined) {
          throw LogParser.PARSING_ERROR;
        }
      } else {
        startIndex = 0;
        if (eventLine.indexOf(' ') === -1) {
          endIndex = eventLine.length;
        } else {
          endIndex = eventLine.indexOf(' ');
        }
        nextIndex = endIndex + 1;
      }
      lineSplit.push(
        eventLine
          .slice(startIndex, endIndex)
          .replace(new RegExp("\\\\'", 'g'), "'")
      );
      eventLine = eventLine.slice(nextIndex);
    }
    return lineSplit;
  }

  private static eventLogAttributeOf(
    key: string,
    value: string
  ): EventLogAttribute {
    switch (value) {
      case 'true':
        return new BooleanAttribute(true, key);
      case 'false':
        return new BooleanAttribute(false, key);
    }

    if (value.includes('T') || value.includes(':') || value.includes('-')) {
      const timestamp = Date.parse(value);
      if (!isNaN(timestamp)) {
        return new DateAttribute(new Date(timestamp).toISOString(), key);
      }
    }

    if (value.includes('.') || value.includes(',')) {
      const asFloat = parseFloat(value);
      if (!isNaN(asFloat)) {
        return new FloatAttribute(asFloat, key);
      }
    }

    const asInt = parseInt(value);
    if (!isNaN(asInt)) {
      return new IntAttribute(asInt, key);
    }

    return new StringAttribute(value, key);
  }

  private static indexOfTokenIfExists(lines: string[], token: string): number {
    const indexOfToken = lines.indexOf(token);
    if (indexOfToken === -1) {
      throw LogParser.PARSING_ERROR;
    }
    return indexOfToken;
  }

  private static nextKeyword(
    keywordIndices: number[],
    actKeyWord: number
  ): number {
    const result = Math.min(
      ...keywordIndices.filter((value) => value > actKeyWord)
    );
    if (isNaN(result)) {
      throw LogParser.PARSING_ERROR;
    }
    return result;
  }
}
