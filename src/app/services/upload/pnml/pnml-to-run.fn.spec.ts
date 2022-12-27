import { getRunTextFromPnml } from './pnml-to-run.fn';

describe('pnml-to-run', () => {
    it('should parse example correctly', () => {
        const result = getRunTextFromPnml(exampleContent);

        expect(result).toEqual(
            '.type run\n' +
                '.events\n' +
                'T1 | a\n' +
                'T2 | x\n' +
                'T3 | b\n' +
                'T4 | y\n' +
                'T5 | c\n' +
                'T6 | u\n' +
                'T7 | v\n' +
                '.arcs\n' +
                'T1 T2\n' +
                'T1 T6\n' +
                'T2 T3\n' +
                'T6 T3\n' +
                'T3 T4\n' +
                'T3 T7\n' +
                'T4 T5\n' +
                'T7 T5\n' +
                'T6 T7\n' +
                'T2 T4'
        );
    });
});

const exampleContent = `
<?xml version="1.0" encoding="UTF-8"?>
<pnml>
     <net id="" type="http://www.pnml.org/version-2009/grammar/ptnet">
          <name>
               <text>Project_PetriNet_Syntehsis1430748661856.pnml</text>
          </name>
          <page id="p1-1430748661881">
               <transition id="T1">
                    <name>
                         <text>a</text>
                         <graphics>
                              <offset x="0" y="0"/>
                         </graphics>
                    </name>
                    <graphics>
                         <position x="184" y="184"/>
                    </graphics>
               </transition>
               <transition id="T2">
                    <name>
                         <text>x</text>
                         <graphics>
                              <offset x="0" y="0"/>
                         </graphics>
                    </name>
                    <graphics>
                         <position x="484" y="134"/>
                    </graphics>
               </transition>
               <transition id="T3">
                    <name>
                         <text>b</text>
                         <graphics>
                              <offset x="0" y="0"/>
                         </graphics>
                    </name>
                    <graphics>
                         <position x="634" y="34"/>
                    </graphics>
               </transition>
               <transition id="T4">
                    <name>
                         <text>y</text>
                         <graphics>
                              <offset x="0" y="0"/>
                         </graphics>
                    </name>
                    <graphics>
                         <position x="784" y="184"/>
                    </graphics>
               </transition>
               <transition id="T5">
                    <name>
                         <text>c</text>
                         <graphics>
                              <offset x="0" y="0"/>
                         </graphics>
                    </name>
                    <graphics>
                         <position x="1034" y="184"/>
                    </graphics>
               </transition>
               <transition id="T6">
                    <name>
                         <text>u</text>
                         <graphics>
                              <offset x="0" y="0"/>
                         </graphics>
                    </name>
                    <graphics>
                         <position x="484" y="134"/>
                    </graphics>
               </transition>
               <transition id="T7">
                    <name>
                         <text>v</text>
                         <graphics>
                              <offset x="0" y="0"/>
                         </graphics>
                    </name>
                    <graphics>
                         <position x="784" y="134"/>
                    </graphics>
               </transition>
               <place id="P0">
                    <name>
                         <text>p0</text>
                         <graphics>
                              <offset x="0" y="0"/>
                         </graphics>
                    </name>
                    <graphics>
                         <position x="34" y="184"/>
                    </graphics>
                    <initialMarking>
                         <text>1</text>
                    </initialMarking>
               </place>
               <place id="P1">
                    <name>
                         <text>p1</text>
                         <graphics>
                              <offset x="0" y="0"/>
                         </graphics>
                    </name>
                    <graphics>
                         <position x="334" y="134"/>
                    </graphics>
                    <initialMarking>
                         <text>0</text>
                    </initialMarking>
               </place>
               <place id="P2">
                    <name>
                         <text>p2</text>
                         <graphics>
                              <offset x="0" y="0"/>
                         </graphics>
                    </name>
                    <graphics>
                         <position x="534" y="84"/>
                    </graphics>
                    <initialMarking>
                         <text>0</text>
                    </initialMarking>
               </place>
               <place id="P3">
                    <name>
                         <text>p3</text>
                         <graphics>
                              <offset x="0" y="0"/>
                         </graphics>
                    </name>
                    <graphics>
                         <position x="734" y="84"/>
                    </graphics>
                    <initialMarking>
                         <text>0</text>
                    </initialMarking>
               </place>
               <place id="P4">
                    <name>
                         <text>p4</text>
                         <graphics>
                              <offset x="0" y="0"/>
                         </graphics>
                    </name>
                    <graphics>
                         <position x="934" y="184"/>
                    </graphics>
                    <initialMarking>
                         <text>0</text>
                    </initialMarking>
               </place>
               <place id="P5">
                    <name>
                         <text>p5</text>
                         <graphics>
                              <offset x="0" y="0"/>
                         </graphics>
                    </name>
                    <graphics>
                         <position x="634" y="134"/>
                    </graphics>
                    <initialMarking>
                         <text>0</text>
                    </initialMarking>
               </place>
               <place id="P6">
                    <name>
                         <text>p6</text>
                         <graphics>
                              <offset x="0" y="0"/>
                         </graphics>
                    </name>
                    <graphics>
                         <position x="634" y="184"/>
                    </graphics>
                    <initialMarking>
                         <text>0</text>
                    </initialMarking>
               </place>
               <arc id="A"
                    source="P0" target="T1">
                    <inscription>
                         <text>1</text>
                    </inscription>
                    <graphics/>
               </arc>
               <arc id="A"
                    source="T1" target="P1">
                    <inscription>
                         <text>1</text>
                    </inscription>
                    <graphics/>
               </arc>
               <arc id="A"
                    source="P1" target="T2">
                    <inscription>
                         <text>1</text>
                    </inscription>
                    <graphics/>
               </arc>
               <arc id="A"
                    source="P1" target="T6">
                    <inscription>
                         <text>1</text>
                    </inscription>
                    <graphics/>
               </arc>
               <arc id="A"
                    source="T2" target="P2">
                    <inscription>
                         <text>1</text>
                    </inscription>
                    <graphics/>
               </arc>
               <arc id="A"
                    source="P2" target="T3">
                    <inscription>
                         <text>1</text>
                    </inscription>
                    <graphics/>
               </arc>
               <arc id="A"
                    source="T6" target="P2">
                    <inscription>
                         <text>1</text>
                    </inscription>
                    <graphics/>
               </arc>
               <arc id="A"
                    source="T3" target="P3">
                    <inscription>
                         <text>1</text>
                    </inscription>
                    <graphics/>
               </arc>
               <arc id="A"
                    source="P3" target="T4">
                    <inscription>
                         <text>1</text>
                    </inscription>
                    <graphics/>
               </arc>
               <arc id="A"
                    source="P3" target="T7">
                    <inscription>
                         <text>1</text>
                    </inscription>
                    <graphics/>
               </arc>
               <arc id="A"
                    source="T4" target="P4">
                    <inscription>
                         <text>1</text>
                    </inscription>
                    <graphics/>
               </arc>
               <arc id="A"
                    source="P4" target="T5">
                    <inscription>
                         <text>1</text>
                    </inscription>
                    <graphics/>
               </arc>
               <arc id="A"
                    source="T7" target="P4">
                    <inscription>
                         <text>1</text>
                    </inscription>
                    <graphics/>
               </arc>
               <arc id="A"
                    source="T6" target="P5">
                    <inscription>
                         <text>1</text>
                    </inscription>
                    <graphics/>
               </arc>
               <arc id="A"
                    source="P5" target="T7">
                    <inscription>
                         <text>1</text>
                    </inscription>
                    <graphics/>
               </arc>
               <arc id="A"
                    source="T2" target="P6">
                    <inscription>
                         <text>1</text>
                    </inscription>
                    <graphics/>
               </arc>
               <arc id="A"
                    source="P6" target="T4">
                    <inscription>
                         <text>1</text>
                    </inscription>
                    <graphics/>
               </arc>
          </page>
     </net>
</pnml>
`;
