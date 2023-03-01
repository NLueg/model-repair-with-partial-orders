export const andLog = `.type log
.attributes
case-id
concept:name
.events
1 a
1 b
1 c
2 a
2 c
2 b`;

export const andPetriNet = `.type pn
.transitions
a a
b b
c c
.places
p0 1
p1 0
.arcs
p0 a
a p1
p1 b
p1 c`;

export const loopLog = `.type log
.attributes
case-id
concept:name
.events
1 a
1 b
1 b
1 b
1 c
2 a
2 b
2 c`;

export const loopPetriNet = `.type pn
.transitions
a a
b b
c c
.places
p0 1
p1 0
.arcs
p0 a
a p1
p1 b
p1 c`;

export const skipLog = `.type log
.attributes
case-id
concept:name
.events
1 a
1 b
1 c
2 a
2 c`;

export const skipNet = `.type pn
.transitions
a a
b b
c c
.places
p0 1
p1 0
p2 0
.arcs
p0 a
a p1
p1 b
b p2
p2 c`;

export const coffeeMachineLog = `.type log
.attributes
case-id
concept:name
event-id
follows[]
.events
1 Grind_Beans km []
1 Unlock_coffee_machine ke []
1 Get_water_with_glass_pot wgh []
1 Empty_strainer fl [ke]
1 Fill_strainer ff [km, fl]
1 Fill_kettle we [wgh, ke]
1 Clean_coffee_pot ka [ke]
1 Assemble_and_turn_on e [ka, we, ff]
2 Grind_Beans km []
2 Unlock_coffee_machine ke []
2 Empty_strainer fl [ke]
2 Fill_strainer ff [km, fl]
2 Clean_coffee_pot ka [ke]
2 Get_water_with_coffee_pot wkh [ka]
2 Fill_kettle we [wkh]
2 Assemble_and_turn_on e [we, ff]`;

export const coffeeMachineNet = `.type pn
.transitions
km Grind_Beans
ff Fill_strainer
fl Empty_strainer
ke Unlock_coffee_machine
ka Clean_coffee_pot
wkh Get_water_with_coffee_pot
wgh Get_water_with_glass_pot
we Fill_kettle
e Assemble_and_turn_on
.places
p0 1
p1 1
p3 0
p4 0
p5 0
p6 0
p7 0
p8 0
p9 0
p10 0
p11 0
.arcs
p0 km
km p3
p3 ff
ff p4
p4 e
p1 ke
ke p5
p5 fl
fl p6
p6 ff
ke p7
p7 ka
ka p8
p8 e
ka p9
p9 wkh
wkh p10
p10 we
we p11
p11 e
p9 wgh
wgh p10`;
