import { TestBed } from '@angular/core/testing';

import { parsedPetriNet } from '../../upload/example-file-parsed';
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
    const result = service.convertPetriNetToPnml(
      `my name.pnml`,
      parsedPetriNet
    );

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
               <transition id="a">
                    <name>
                        <text>a</text>
                        <graphics>
                             <offset x="125" y="110"/>
                        </graphics>
                    </name>
                    <graphics>
                         <position x="125" y="70"/>
                         <dimension x="40" y="40"></dimension>
                    </graphics>
               </transition>
               <transition id="b">
                    <name>
                        <text>b</text>
                        <graphics>
                             <offset x="325" y="65"/>
                        </graphics>
                    </name>
                    <graphics>
                         <position x="325" y="25"/>
                         <dimension x="40" y="40"></dimension>
                    </graphics>
               </transition>
               <transition id="c">
                    <name>
                        <text>c</text>
                        <graphics>
                             <offset x="325" y="155"/>
                        </graphics>
                    </name>
                    <graphics>
                         <position x="325" y="115"/>
                         <dimension x="40" y="40"></dimension>
                    </graphics>
               </transition>
               <transition id="d">
                    <name>
                        <text>d</text>
                        <graphics>
                             <offset x="525" y="110"/>
                        </graphics>
                    </name>
                    <graphics>
                         <position x="525" y="70"/>
                         <dimension x="40" y="40"></dimension>
                    </graphics>
               </transition>
               <place id="p1">
                    <name>
                         <text>p1</text>
                         <graphics>
                              <offset x="25" y="110"/>
                         </graphics>
                    </name>
                    <graphics>
                         <position x="25" y="70"/>
                    </graphics>
                    <initialMarking>
                         <text>1</text>
                    </initialMarking>
               </place>
               <place id="p2">
                    <name>
                         <text>p2</text>
                         <graphics>
                              <offset x="225" y="110"/>
                         </graphics>
                    </name>
                    <graphics>
                         <position x="225" y="70"/>
                    </graphics>
                    <initialMarking>
                         <text>0</text>
                    </initialMarking>
               </place>
               <place id="p3">
                    <name>
                         <text>p3</text>
                         <graphics>
                              <offset x="425" y="65"/>
                         </graphics>
                    </name>
                    <graphics>
                         <position x="425" y="25"/>
                    </graphics>
                    <initialMarking>
                         <text>0</text>
                    </initialMarking>
               </place>
               <place id="p4">
                    <name>
                         <text>p4</text>
                         <graphics>
                              <offset x="425" y="155"/>
                         </graphics>
                    </name>
                    <graphics>
                         <position x="425" y="115"/>
                    </graphics>
                    <initialMarking>
                         <text>0</text>
                    </initialMarking>
               </place>
               <place id="p5">
                    <name>
                         <text>p5</text>
                         <graphics>
                              <offset x="625" y="110"/>
                         </graphics>
                    </name>
                    <graphics>
                         <position x="625" y="70"/>
                    </graphics>
                    <initialMarking>
                         <text>0</text>
                    </initialMarking>
               </place>
               <arc id="A"
                    source="p1" target="a">
                    <inscription>
                        <text>1</text>
                    </inscription>
                    <graphics/>
               </arc>
                <arc id="A"
                    source="a" target="p2">
                    <inscription>
                        <text>1</text>
                    </inscription>
                    <graphics/>
               </arc>
                <arc id="A"
                    source="p2" target="b">
                    <inscription>
                        <text>1</text>
                    </inscription>
                    <graphics/>
               </arc>
                <arc id="A"
                    source="p2" target="c">
                    <inscription>
                        <text>1</text>
                    </inscription>
                    <graphics/>
               </arc>
                <arc id="A"
                    source="b" target="p3">
                    <inscription>
                        <text>1</text>
                    </inscription>
                    <graphics/>
               </arc>
                <arc id="A"
                    source="c" target="p4">
                    <inscription>
                        <text>1</text>
                    </inscription>
                    <graphics/>
               </arc>
                <arc id="A"
                    source="p3" target="d">
                    <inscription>
                        <text>1</text>
                    </inscription>
                    <graphics/>
               </arc>
                <arc id="A"
                    source="p4" target="d">
                    <inscription>
                        <text>1</text>
                    </inscription>
                    <graphics/>
               </arc>
                <arc id="A"
                    source="d" target="p5">
                    <inscription>
                        <text>1</text>
                    </inscription>
                    <graphics/>
               </arc>
          </page>
     </net>
</pnml>`;
