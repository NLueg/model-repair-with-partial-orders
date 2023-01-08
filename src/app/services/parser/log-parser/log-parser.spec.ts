import { LogParser } from './log-parser';

describe('LogParser', () => {
  let parser: LogParser;

  beforeEach(() => {
    parser = new LogParser();
  });

  it('should be created', () => {
    expect(parser).toBeTruthy();
  });

  it('should parse empty string correctly', () => {
    expect(parser.parse('')).toEqual({
      _attributes: [],
      _classifiers: [],
      _globalEventAttributes: [],
      _globalTraceAttributes: [],
      _traces: [],
    });
  });

  it('should parse example correctly', () => {
    expect(
      parser.parse(`.type log
.attributes
case-id
concept:name
event-id
follows[]
.events
1 a e1
1 b e2 [e1]
1 c e3 [e1]
1 d e4 [e2,
2 x e5
2 b e6 [e5]
2 c e7 [e5]
2 d e8 [e6,e7]`)
    ).toEqual({
      _attributes: [],
      _classifiers: [],
      _globalEventAttributes: [],
      _globalTraceAttributes: [],
      _traces: [
        {
          _attributes: [],
          _caseId: 1,
          _events: [
            {
              _activity: 'a',
              _attributes: [
                {
                  key: 'event-id',
                  value: 'e1',
                },
              ],
            },
            {
              _activity: 'b',
              _attributes: [
                {
                  key: 'event-id',
                  value: 'e2',
                },
                {
                  key: 'follows[]',
                  value: '[e1]',
                },
              ],
            },
            {
              _activity: 'c',
              _attributes: [
                {
                  key: 'event-id',
                  value: 'e3',
                },
                {
                  key: 'follows[]',
                  value: '[e1]',
                },
              ],
            },
            {
              _activity: 'd',
              _attributes: [
                {
                  key: 'event-id',
                  value: 'e4',
                },
                {
                  key: 'follows[]',
                  value: '[e2,',
                },
              ],
            },
          ],
        },
        {
          _attributes: [],
          _caseId: 2,
          _events: [
            {
              _activity: 'x',
              _attributes: [
                {
                  key: 'event-id',
                  value: 'e5',
                },
              ],
            },
            {
              _activity: 'b',
              _attributes: [
                {
                  key: 'event-id',
                  value: 'e6',
                },
                {
                  key: 'follows[]',
                  value: '[e5]',
                },
              ],
            },
            {
              _activity: 'c',
              _attributes: [
                {
                  key: 'event-id',
                  value: 'e7',
                },
                {
                  key: 'follows[]',
                  value: '[e5]',
                },
              ],
            },
            {
              _activity: 'd',
              _attributes: [
                {
                  key: 'event-id',
                  value: 'e8',
                },
                {
                  key: 'follows[]',
                  value: '[e6,e7]',
                },
              ],
            },
          ],
        },
      ],
    });
  });

  it('should parse large example correctly', () => {
    expect(
      parser.parse(`.type log
.attributes
case-id
concept:name
org:resource
lifecycle:transition
time:timestamp
numberRepairs
defectFixed
defectType
phoneType
.events
1 Register System complete 1970-01-02T12:23:00.000Z
1 'Analyze Defect' Tester3 start 1970-01-02T12:23:00.000Z
1 'Analyze Defect' Tester3 complete 1970-01-02T12:30:00.000Z '' '' 6 T2
1 'Repair (Complex)' SolverC1 start 1970-01-02T12:31:00.000Z
1 'Repair (Complex)' SolverC1 complete 1970-01-02T12:49:00.000Z
1 'Test Repair' Tester3 start 1970-01-02T12:49:00.000Z
1 'Test Repair' Tester3 complete 1970-01-02T12:55:00.000Z 0 true
1 'Inform User' System complete 1970-01-02T13:10:00.000Z
1 'Archive Repair' System complete 1970-01-02T13:10:00.000Z 0 true
10 Register System complete 1970-01-01T11:09:00.000Z
10 'Analyze Defect' Tester2 start 1970-01-01T11:09:00.000Z
10 'Analyze Defect' Tester2 complete 1970-01-01T11:15:00.000Z '' '' 3 T1
10 'Repair (Simple)' SolverS1 start 1970-01-01T11:35:00.000Z
10 'Repair (Simple)' SolverS1 complete 1970-01-01T11:42:00.000Z
10 'Test Repair' Tester6 start 1970-01-01T11:42:00.000Z
10 'Test Repair' Tester6 complete 1970-01-01T11:48:00.000Z 1 false
10 'Restart Repair' System complete 1970-01-01T11:54:00.000Z
10 'Repair (Simple)' SolverS2 start 1970-01-01T11:54:00.000Z
10 'Inform User' System complete 1970-01-01T11:55:00.000Z
10 'Repair (Simple)' SolverS2 complete 1970-01-01T12:03:00.000Z
10 'Test Repair' Tester4 start 1970-01-01T12:03:00.000Z
10 'Test Repair' Tester4 complete 1970-01-01T12:09:00.000Z 2 true
10 'Archive Repair' System complete 1970-01-01T12:14:00.000Z 2 true
100 Register System complete 1970-01-04T02:28:00.000Z
100 'Analyze Defect' Tester4 start 1970-01-04T02:28:00.000Z
100 'Analyze Defect' Tester4 complete 1970-01-04T02:36:00.000Z '' '' 8 T2
100 'Repair (Complex)' SolverC1 start 1970-01-04T02:52:00.000Z
100 'Repair (Complex)' SolverC1 complete 1970-01-04T03:09:00.000Z
100 'Test Repair' Tester1 start 1970-01-04T03:09:00.000Z
100 'Test Repair' Tester1 complete 1970-01-04T03:18:00.000Z 0 true
100 'Inform User' System complete 1970-01-04T03:20:00.000Z
100 'Archive Repair' System complete 1970-01-04T03:28:00.000Z 0 true`)
    ).toEqual({
      _attributes: [],
      _classifiers: [],
      _globalEventAttributes: [],
      _globalTraceAttributes: [],
      _traces: [
        {
          _attributes: [],
          _caseId: 1,
          _events: [
            {
              _activity: 'Register',
              _attributes: [
                {
                  key: 'org:resource',
                  value: 'System',
                },
                {
                  key: 'lifecycle:transition',
                  value: 'complete',
                },
                {
                  key: 'time:timestamp',
                  value: '1970-01-02T12:23:00.000Z',
                },
              ],
            },
            {
              _activity: 'Analyze Defect',
              _attributes: [
                {
                  key: 'org:resource',
                  value: 'Tester3',
                },
                {
                  key: 'lifecycle:transition',
                  value: 'start',
                },
                {
                  key: 'time:timestamp',
                  value: '1970-01-02T12:23:00.000Z',
                },
              ],
            },
            {
              _activity: 'Analyze Defect',
              _attributes: [
                {
                  key: 'org:resource',
                  value: 'Tester3',
                },
                {
                  key: 'lifecycle:transition',
                  value: 'complete',
                },
                {
                  key: 'time:timestamp',
                  value: '1970-01-02T12:30:00.000Z',
                },
                {
                  key: 'defectType',
                  value: 6,
                },
                {
                  key: 'phoneType',
                  value: 'T2',
                },
              ],
            },
            {
              _activity: 'Repair (Complex)',
              _attributes: [
                {
                  key: 'org:resource',
                  value: 'SolverC1',
                },
                {
                  key: 'lifecycle:transition',
                  value: 'start',
                },
                {
                  key: 'time:timestamp',
                  value: '1970-01-02T12:31:00.000Z',
                },
              ],
            },
            {
              _activity: 'Repair (Complex)',
              _attributes: [
                {
                  key: 'org:resource',
                  value: 'SolverC1',
                },
                {
                  key: 'lifecycle:transition',
                  value: 'complete',
                },
                {
                  key: 'time:timestamp',
                  value: '1970-01-02T12:49:00.000Z',
                },
              ],
            },
            {
              _activity: 'Test Repair',
              _attributes: [
                {
                  key: 'org:resource',
                  value: 'Tester3',
                },
                {
                  key: 'lifecycle:transition',
                  value: 'start',
                },
                {
                  key: 'time:timestamp',
                  value: '1970-01-02T12:49:00.000Z',
                },
              ],
            },
            {
              _activity: 'Test Repair',
              _attributes: [
                {
                  key: 'org:resource',
                  value: 'Tester3',
                },
                {
                  key: 'lifecycle:transition',
                  value: 'complete',
                },
                {
                  key: 'time:timestamp',
                  value: '1970-01-02T12:55:00.000Z',
                },
                {
                  key: 'numberRepairs',
                  value: 0,
                },
                {
                  key: 'defectFixed',
                  value: true,
                },
              ],
            },
            {
              _activity: 'Inform User',
              _attributes: [
                {
                  key: 'org:resource',
                  value: 'System',
                },
                {
                  key: 'lifecycle:transition',
                  value: 'complete',
                },
                {
                  key: 'time:timestamp',
                  value: '1970-01-02T13:10:00.000Z',
                },
              ],
            },
            {
              _activity: 'Archive Repair',
              _attributes: [
                {
                  key: 'org:resource',
                  value: 'System',
                },
                {
                  key: 'lifecycle:transition',
                  value: 'complete',
                },
                {
                  key: 'time:timestamp',
                  value: '1970-01-02T13:10:00.000Z',
                },
                {
                  key: 'numberRepairs',
                  value: 0,
                },
                {
                  key: 'defectFixed',
                  value: true,
                },
              ],
            },
          ],
        },
        {
          _attributes: [],
          _caseId: 10,
          _events: [
            {
              _activity: 'Register',
              _attributes: [
                {
                  key: 'org:resource',
                  value: 'System',
                },
                {
                  key: 'lifecycle:transition',
                  value: 'complete',
                },
                {
                  key: 'time:timestamp',
                  value: '1970-01-01T11:09:00.000Z',
                },
              ],
            },
            {
              _activity: 'Analyze Defect',
              _attributes: [
                {
                  key: 'org:resource',
                  value: 'Tester2',
                },
                {
                  key: 'lifecycle:transition',
                  value: 'start',
                },
                {
                  key: 'time:timestamp',
                  value: '1970-01-01T11:09:00.000Z',
                },
              ],
            },
            {
              _activity: 'Analyze Defect',
              _attributes: [
                {
                  key: 'org:resource',
                  value: 'Tester2',
                },
                {
                  key: 'lifecycle:transition',
                  value: 'complete',
                },
                {
                  key: 'time:timestamp',
                  value: '1970-01-01T11:15:00.000Z',
                },
                {
                  key: 'defectType',
                  value: 3,
                },
                {
                  key: 'phoneType',
                  value: 'T1',
                },
              ],
            },
            {
              _activity: 'Repair (Simple)',
              _attributes: [
                {
                  key: 'org:resource',
                  value: 'SolverS1',
                },
                {
                  key: 'lifecycle:transition',
                  value: 'start',
                },
                {
                  key: 'time:timestamp',
                  value: '1970-01-01T11:35:00.000Z',
                },
              ],
            },
            {
              _activity: 'Repair (Simple)',
              _attributes: [
                {
                  key: 'org:resource',
                  value: 'SolverS1',
                },
                {
                  key: 'lifecycle:transition',
                  value: 'complete',
                },
                {
                  key: 'time:timestamp',
                  value: '1970-01-01T11:42:00.000Z',
                },
              ],
            },
            {
              _activity: 'Test Repair',
              _attributes: [
                {
                  key: 'org:resource',
                  value: 'Tester6',
                },
                {
                  key: 'lifecycle:transition',
                  value: 'start',
                },
                {
                  key: 'time:timestamp',
                  value: '1970-01-01T11:42:00.000Z',
                },
              ],
            },
            {
              _activity: 'Test Repair',
              _attributes: [
                {
                  key: 'org:resource',
                  value: 'Tester6',
                },
                {
                  key: 'lifecycle:transition',
                  value: 'complete',
                },
                {
                  key: 'time:timestamp',
                  value: '1970-01-01T11:48:00.000Z',
                },
                {
                  key: 'numberRepairs',
                  value: 1,
                },
                {
                  key: 'defectFixed',
                  value: false,
                },
              ],
            },
            {
              _activity: 'Restart Repair',
              _attributes: [
                {
                  key: 'org:resource',
                  value: 'System',
                },
                {
                  key: 'lifecycle:transition',
                  value: 'complete',
                },
                {
                  key: 'time:timestamp',
                  value: '1970-01-01T11:54:00.000Z',
                },
              ],
            },
            {
              _activity: 'Repair (Simple)',
              _attributes: [
                {
                  key: 'org:resource',
                  value: 'SolverS2',
                },
                {
                  key: 'lifecycle:transition',
                  value: 'start',
                },
                {
                  key: 'time:timestamp',
                  value: '1970-01-01T11:54:00.000Z',
                },
              ],
            },
            {
              _activity: 'Inform User',
              _attributes: [
                {
                  key: 'org:resource',
                  value: 'System',
                },
                {
                  key: 'lifecycle:transition',
                  value: 'complete',
                },
                {
                  key: 'time:timestamp',
                  value: '1970-01-01T11:55:00.000Z',
                },
              ],
            },
            {
              _activity: 'Repair (Simple)',
              _attributes: [
                {
                  key: 'org:resource',
                  value: 'SolverS2',
                },
                {
                  key: 'lifecycle:transition',
                  value: 'complete',
                },
                {
                  key: 'time:timestamp',
                  value: '1970-01-01T12:03:00.000Z',
                },
              ],
            },
            {
              _activity: 'Test Repair',
              _attributes: [
                {
                  key: 'org:resource',
                  value: 'Tester4',
                },
                {
                  key: 'lifecycle:transition',
                  value: 'start',
                },
                {
                  key: 'time:timestamp',
                  value: '1970-01-01T12:03:00.000Z',
                },
              ],
            },
            {
              _activity: 'Test Repair',
              _attributes: [
                {
                  key: 'org:resource',
                  value: 'Tester4',
                },
                {
                  key: 'lifecycle:transition',
                  value: 'complete',
                },
                {
                  key: 'time:timestamp',
                  value: '1970-01-01T12:09:00.000Z',
                },
                {
                  key: 'numberRepairs',
                  value: 2,
                },
                {
                  key: 'defectFixed',
                  value: true,
                },
              ],
            },
            {
              _activity: 'Archive Repair',
              _attributes: [
                {
                  key: 'org:resource',
                  value: 'System',
                },
                {
                  key: 'lifecycle:transition',
                  value: 'complete',
                },
                {
                  key: 'time:timestamp',
                  value: '1970-01-01T12:14:00.000Z',
                },
                {
                  key: 'numberRepairs',
                  value: 2,
                },
                {
                  key: 'defectFixed',
                  value: true,
                },
              ],
            },
          ],
        },
        {
          _attributes: [],
          _caseId: 100,
          _events: [
            {
              _activity: 'Register',
              _attributes: [
                {
                  key: 'org:resource',
                  value: 'System',
                },
                {
                  key: 'lifecycle:transition',
                  value: 'complete',
                },
                {
                  key: 'time:timestamp',
                  value: '1970-01-04T02:28:00.000Z',
                },
              ],
            },
            {
              _activity: 'Analyze Defect',
              _attributes: [
                {
                  key: 'org:resource',
                  value: 'Tester4',
                },
                {
                  key: 'lifecycle:transition',
                  value: 'start',
                },
                {
                  key: 'time:timestamp',
                  value: '1970-01-04T02:28:00.000Z',
                },
              ],
            },
            {
              _activity: 'Analyze Defect',
              _attributes: [
                {
                  key: 'org:resource',
                  value: 'Tester4',
                },
                {
                  key: 'lifecycle:transition',
                  value: 'complete',
                },
                {
                  key: 'time:timestamp',
                  value: '1970-01-04T02:36:00.000Z',
                },
                {
                  key: 'defectType',
                  value: 8,
                },
                {
                  key: 'phoneType',
                  value: 'T2',
                },
              ],
            },
            {
              _activity: 'Repair (Complex)',
              _attributes: [
                {
                  key: 'org:resource',
                  value: 'SolverC1',
                },
                {
                  key: 'lifecycle:transition',
                  value: 'start',
                },
                {
                  key: 'time:timestamp',
                  value: '1970-01-04T02:52:00.000Z',
                },
              ],
            },
            {
              _activity: 'Repair (Complex)',
              _attributes: [
                {
                  key: 'org:resource',
                  value: 'SolverC1',
                },
                {
                  key: 'lifecycle:transition',
                  value: 'complete',
                },
                {
                  key: 'time:timestamp',
                  value: '1970-01-04T03:09:00.000Z',
                },
              ],
            },
            {
              _activity: 'Test Repair',
              _attributes: [
                {
                  key: 'org:resource',
                  value: 'Tester1',
                },
                {
                  key: 'lifecycle:transition',
                  value: 'start',
                },
                {
                  key: 'time:timestamp',
                  value: '1970-01-04T03:09:00.000Z',
                },
              ],
            },
            {
              _activity: 'Test Repair',
              _attributes: [
                {
                  key: 'org:resource',
                  value: 'Tester1',
                },
                {
                  key: 'lifecycle:transition',
                  value: 'complete',
                },
                {
                  key: 'time:timestamp',
                  value: '1970-01-04T03:18:00.000Z',
                },
                {
                  key: 'numberRepairs',
                  value: 0,
                },
                {
                  key: 'defectFixed',
                  value: true,
                },
              ],
            },
            {
              _activity: 'Inform User',
              _attributes: [
                {
                  key: 'org:resource',
                  value: 'System',
                },
                {
                  key: 'lifecycle:transition',
                  value: 'complete',
                },
                {
                  key: 'time:timestamp',
                  value: '1970-01-04T03:20:00.000Z',
                },
              ],
            },
            {
              _activity: 'Archive Repair',
              _attributes: [
                {
                  key: 'org:resource',
                  value: 'System',
                },
                {
                  key: 'lifecycle:transition',
                  value: 'complete',
                },
                {
                  key: 'time:timestamp',
                  value: '1970-01-04T03:28:00.000Z',
                },
                {
                  key: 'numberRepairs',
                  value: 0,
                },
                {
                  key: 'defectFixed',
                  value: true,
                },
              ],
            },
          ],
        },
      ],
    });
  });
});
