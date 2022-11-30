import { TestBed } from '@angular/core/testing';

import { PetriNet } from '../../../classes/diagram/petriNet';
import { RunToPnmlService } from './run-to-pnml.service';

describe('RunToPnmlService', () => {
  let service: RunToPnmlService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RunToPnmlService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should parse example run to pnml', () => {
    const result = service.parseRunToPnml(`my name.pnml`, exampleRun);

    expect(result).toEqual(parsedPnml);
  });
});

const parsedPnml = `<?xml version="1.0" encoding="UTF-8"?>

<pnml>
     <net id="" type="http://www.pnml.org/version-2009/grammar/ptnet">
          <name>
               <text>my name.pnml</text>
          </name>
          <page id="p1">
               <transition id="t1">
                    <name>
                        <text>t1</text>
                        <graphics>
                             <offset x="200" y="40"/>
                        </graphics>
                    </name>
                    <graphics>
                         <position x="200" y="0"/>
                         <dimension x="40" y="40"></dimension>
                    </graphics>
               </transition>
               <transition id="t2">
                    <name>
                        <text>t2</text>
                        <graphics>
                             <offset x="400" y="53.333333333333336"/>
                        </graphics>
                    </name>
                    <graphics>
                         <position x="400" y="13.333333333333334"/>
                         <dimension x="40" y="40"></dimension>
                    </graphics>
               </transition>
               <transition id="t3">
                    <name>
                        <text>t3</text>
                        <graphics>
                             <offset x="1200" y="240"/>
                        </graphics>
                    </name>
                    <graphics>
                         <position x="1200" y="200"/>
                         <dimension x="40" y="40"></dimension>
                    </graphics>
               </transition>
               <transition id="t4">
                    <name>
                        <text>t4</text>
                        <graphics>
                             <offset x="600" y="72"/>
                        </graphics>
                    </name>
                    <graphics>
                         <position x="600" y="32"/>
                         <dimension x="40" y="40"></dimension>
                    </graphics>
               </transition>
               <transition id="t5">
                    <name>
                        <text>t5</text>
                        <graphics>
                             <offset x="800" y="72"/>
                        </graphics>
                    </name>
                    <graphics>
                         <position x="800" y="32"/>
                         <dimension x="40" y="40"></dimension>
                    </graphics>
               </transition>
               <transition id="t6">
                    <name>
                        <text>t6</text>
                        <graphics>
                             <offset x="1000" y="72"/>
                        </graphics>
                    </name>
                    <graphics>
                         <position x="1000" y="32"/>
                         <dimension x="40" y="40"></dimension>
                    </graphics>
               </transition>
               <place id="p0">
                    <name>
                         <text>p0</text>
                         <graphics>
                              <offset x="100" y="240"/>
                         </graphics>
                    </name>
                    <graphics>
                         <position x="100" y="200"/>
                    </graphics>
                    <initialMarking>
                         <text>1</text>
                    </initialMarking>
               </place>
               <place id="t1t2">
                    <name>
                         <text>t1t2</text>
                         <graphics>
                              <offset x="300" y="40"/>
                         </graphics>
                    </name>
                    <graphics>
                         <position x="300" y="0"/>
                    </graphics>
                    <initialMarking>
                         <text>0</text>
                    </initialMarking>
               </place>
               <place id="t2t4">
                    <name>
                         <text>t2t4</text>
                         <graphics>
                              <offset x="500" y="53.333333333333336"/>
                         </graphics>
                    </name>
                    <graphics>
                         <position x="500" y="13.333333333333334"/>
                    </graphics>
                    <initialMarking>
                         <text>0</text>
                    </initialMarking>
               </place>
               <place id="t4t3">
                    <name>
                         <text>t4t3</text>
                         <graphics>
                              <offset x="700" y="146.66666666666669"/>
                         </graphics>
                    </name>
                    <graphics>
                         <position x="700" y="106.66666666666667"/>
                    </graphics>
                    <initialMarking>
                         <text>0</text>
                    </initialMarking>
               </place>
               <place id="t4t5">
                    <name>
                         <text>t4t5</text>
                         <graphics>
                              <offset x="700" y="53.333333333333336"/>
                         </graphics>
                    </name>
                    <graphics>
                         <position x="700" y="13.333333333333334"/>
                    </graphics>
                    <initialMarking>
                         <text>0</text>
                    </initialMarking>
               </place>
               <place id="t5t3">
                    <name>
                         <text>t5t3</text>
                         <graphics>
                              <offset x="900" y="146.66666666666669"/>
                         </graphics>
                    </name>
                    <graphics>
                         <position x="900" y="106.66666666666667"/>
                    </graphics>
                    <initialMarking>
                         <text>0</text>
                    </initialMarking>
               </place>
               <place id="t5t6">
                    <name>
                         <text>t5t6</text>
                         <graphics>
                              <offset x="900" y="53.333333333333336"/>
                         </graphics>
                    </name>
                    <graphics>
                         <position x="900" y="13.333333333333334"/>
                    </graphics>
                    <initialMarking>
                         <text>0</text>
                    </initialMarking>
               </place>
               <place id="t6t3">
                    <name>
                         <text>t6t3</text>
                         <graphics>
                              <offset x="1100" y="72"/>
                         </graphics>
                    </name>
                    <graphics>
                         <position x="1100" y="32"/>
                    </graphics>
                    <initialMarking>
                         <text>0</text>
                    </initialMarking>
               </place>
               <arc id="A"
                    source="p0" target="t6">
                    <inscription>
                        <text>1</text>
                    </inscription>
                    <graphics/>
               </arc>
                <arc id="A"
                    source="p0" target="t5">
                    <inscription>
                        <text>1</text>
                    </inscription>
                    <graphics/>
               </arc>
                <arc id="A"
                    source="p0" target="t4">
                    <inscription>
                        <text>1</text>
                    </inscription>
                    <graphics/>
               </arc>
                <arc id="A"
                    source="p0" target="t3">
                    <inscription>
                        <text>1</text>
                    </inscription>
                    <graphics/>
               </arc>
                <arc id="A"
                    source="p0" target="t2">
                    <inscription>
                        <text>1</text>
                    </inscription>
                    <graphics/>
               </arc>
                <arc id="A"
                    source="p0" target="t1">
                    <inscription>
                        <text>1</text>
                    </inscription>
                    <graphics/>
               </arc>
                <arc id="A"
                    source="t1" target="t1t2">
                    <inscription>
                        <text>1</text>
                    </inscription>
                    <graphics/>
               </arc>
                <arc id="A"
                    source="t1t2" target="t2">
                    <inscription>
                        <text>1</text>
                    </inscription>
                    <graphics/>
               </arc>
                <arc id="A"
                    source="t2" target="t2t4">
                    <inscription>
                        <text>1</text>
                    </inscription>
                    <graphics/>
               </arc>
                <arc id="A"
                    source="t2t4" target="t4">
                    <inscription>
                        <text>1</text>
                    </inscription>
                    <graphics/>
               </arc>
                <arc id="A"
                    source="t4" target="t4t3">
                    <inscription>
                        <text>1</text>
                    </inscription>
                    <graphics/>
               </arc>
                <arc id="A"
                    source="t4t3" target="t3">
                    <inscription>
                        <text>1</text>
                    </inscription>
                    <graphics/>
               </arc>
                <arc id="A"
                    source="t4" target="t4t5">
                    <inscription>
                        <text>1</text>
                    </inscription>
                    <graphics/>
               </arc>
                <arc id="A"
                    source="t4t5" target="t5">
                    <inscription>
                        <text>1</text>
                    </inscription>
                    <graphics/>
               </arc>
                <arc id="A"
                    source="t5" target="t5t3">
                    <inscription>
                        <text>1</text>
                    </inscription>
                    <graphics/>
               </arc>
                <arc id="A"
                    source="t5t3" target="t3">
                    <inscription>
                        <text>1</text>
                    </inscription>
                    <graphics/>
               </arc>
                <arc id="A"
                    source="t5" target="t5t6">
                    <inscription>
                        <text>1</text>
                    </inscription>
                    <graphics/>
               </arc>
                <arc id="A"
                    source="t5t6" target="t6">
                    <inscription>
                        <text>1</text>
                    </inscription>
                    <graphics/>
               </arc>
                <arc id="A"
                    source="t6" target="t6t3">
                    <inscription>
                        <text>1</text>
                    </inscription>
                    <graphics/>
               </arc>
                <arc id="A"
                    source="t6t3" target="t3">
                    <inscription>
                        <text>1</text>
                    </inscription>
                    <graphics/>
               </arc>
          </page>
     </net>
</pnml>`;

const exampleRun: PetriNet = {
  text: '.type run\n.events\nt1\nt2\nt3\nt4\nt5\nt6\n.arcs\nt1 t2\nt2 t4\nt4 t3\nt4 t5\nt5 t3\nt5 t6\nt6 t3\n',
  arcs: [
    { source: 't1', target: 't2', breakpoints: [] },
    { source: 't2', target: 't4', breakpoints: [] },
    { source: 't4', target: 't3', breakpoints: [] },
    { source: 't4', target: 't5', breakpoints: [] },
    { source: 't5', target: 't3', breakpoints: [] },
    { source: 't5', target: 't6', breakpoints: [] },
    { source: 't6', target: 't3', breakpoints: [] },
  ],
  elements: [
    {
      id: 't1',
      label: 't1',
      incomingArcs: [],
      outgoingArcs: [],
    },
    {
      id: 't2',
      label: 't2',
      incomingArcs: [],
      outgoingArcs: [],
    },
    {
      id: 't3',
      label: 't3',
      incomingArcs: [],
      outgoingArcs: [],
    },
    {
      id: 't4',
      label: 't4',
      incomingArcs: [],
      outgoingArcs: [],
    },
    {
      id: 't5',
      label: 't5',
      incomingArcs: [],
      outgoingArcs: [],
    },
    {
      id: 't6',
      label: 't6',
      incomingArcs: [],
      outgoingArcs: [],
    },
  ],
  warnings: [],
};
